const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const auth = require('../middleware/auth')
const formidable = require('formidable')
const path = require('path') // for node.js to know the path thats the pic gunna go
const fs = require('fs') // file system

// ADD PRODUCT 
router.post("/", auth, (req, res) => {
    if (!req.user.isAdmin) return res.status(401).json({msg: "Unauthorized! You are not an admin!"})

    const form = new formidable.IncomingForm()
    form.parse(req, (e, fields, files) => {
        if(e) return res.json({e})

        const product = new Product(fields)
        let date = new Date().getTime()
        let oldPath = files.image.filepath // access to the filepath (go in files -> image -> filepath)
        let newPath = path.join(__dirname, "../public/") + date + "-" + files.image.originalFilename // create new address to let the picture store in public folder
        // join __dirname = directory name which is the public folder with the original file name

        let rawData = fs.readFileSync(oldPath) // read file in synchronous way
        fs.writeFileSync(newPath, rawData) // write it in the new path

        product.image = '/public/' + date + "-" + files.image.originalFilename // the image in product(fields) shud name after... 
        product.save() // save it to robo
        return res.json({msg: "Hooray your product is online!", product})
    })
})


// GET ALL PRODUCT
router.get("/", async (req, res) => {
    try {
        const products = await Product.find({})
        return res.json(products)
    } catch(err) {
        return res.json({msg: "No products hmm"})
    }
})


// GET SINGLE PRODUCT BY ID 
router.get('/:id', async (req, res) => { // what ever that is passing after colon: get stored in the url eg:"/:id" will be send 
    try {
        const product = await Product.findById(req.params.id) // request the id from the url from params(parameter)
        return res.json({product})

    } catch(err) {
        return res.json({msg: "Can't get em why?"})
    }
})

// GET ALL PRODUCT BY KEYWORD
router.get('/search/:key', async (req, res) => {
    try {
        const product = await Product.find({name: { $regex: req.params.key , $options: "i" }})
        if(product.length){
            return res.json(product)
        } else {
            return res.json({msg: 'no products to show'})
        }

    } catch (err) {
        return res.json({msg: "it doesnt exists!"})
    }
})

// UPDATE PRODUCT
router.put('/:id', auth, async (req, res) => {
    try {
        let product = await Product.findByIdAndUpdate(req.params.id)
        if(!req.user.isAdmin) return res.json({msg: "Unauthorized user, access denied!"})
        
        const form = new formidable.IncomingForm()
        form.parse(req, (err, fields, files) => {
            if(err) return res.json({msg: "error occured, try again"})
    
            product.name = fields.name
            product.quantity = fields.quantity
            product.price = fields.price
            product.description = fields.description
            product.category = fields.category
    
            let date = new Date().getTime()
            let oldPath = files.image.filepath
            let newPath = path.join(__dirname, "../public/") + date + "-" + files.image.originalFilename 
    
            let rawData = fs.readFileSync(oldPath) 
            fs.writeFileSync(newPath, rawData)
            product.image = '/public/' + date + "-" + files.image.originalFilename
    
            product.save()
            return res.json({msg: "noiceee updated!", product})
        })

    } catch(err) {
        return res.json({msg: "Update Failed!"})
    }
})

// DELETE PRODUCT
router.delete('/:id', auth, async (req, res) => {
    try{
        if (!req.user.isAdmin) return res.status(401).json({msg: "Unauthorized! You are not an admin!"})

        // cuz we using async await so try to avoid functions, do line by line
        const product = await Product.findByIdAndDelete(req.params.id)
        fs.unlinkSync(path.join(__dirname, "../", product.image)) //path/to/folder/public/image.jpg
        return res.json({msg: "Deleted!", product})

        
    } catch(err) {
        return res.json({msg: "its not deleted!"})
    }
})



module.exports = router