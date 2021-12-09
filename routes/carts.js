const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Cart = require('../models/Cart')
const Product = require('../models/Product')

//VIEW CART 
router.get('/', auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({userId: req.user.id})
        if(cart && cart.items.length > 0) {
            return res.json(cart)
        } else {
            return res.json({msg: "Your cart is empty"})
        }
    } catch(e) {
        return res.status(400).json(e)
    }
})


//ADD TO CART
router.post('/', auth, async (req, res) => {
    try {
        const userId = req.user.id
        const { quantity, itemId } = req.body
        const product = await Product.findById(itemId)
        const cart = await Cart.findOne({userId})

        if(quantity >= product.quantity ) return res.json({msg: "You requesting too much, we dun have"})

        //IF THE CART IS EMPTY
        if(cart === null && quantity < product.quantity) {
            const newCart = await Cart.create({
                userId,
                items: [
                    {
                        itemId, 
                        name: product.name, 
                        quantity, 
                        price: product.price, 
                        subtotal: product.price * quantity
                    }
                ],
                total: product.price * quantity
            })
            return res,json({msg: "Item added to cart successfully", newCart})
        }

        if(cart) {
            const foundProduct = cart.items.find(item => item.itemId === itemId)
            //if you're adding an item already existing in your cart
            if(foundProduct) {
                if (quantity > foundProduct.quantity) return res.json({msg: "u added more than availible"})
                
                foundProduct.quantity += quantity
                foundProduct.subtotal += (quantity * foundProduct.price)
                cart.total = foundProduct.quantity * foundProduct.price
            } else {
                cart.items.push({
                    itemId,
                    name: product.name,
                    quantity,
                    price: product.price,
                    subtotal: product.price * quantity
                })
                cart.total += (product.price * quantity)
            }
            await cart.save()
            return res.json({msg: "Added to cart successfully", cart: cart.items, total: cart.total})
        }
    } catch(e) {
        return res.status(400).json(e)
    } //closing of catch
}) //closing of router


// DELETE SINGLE ITEM IN CART BY THE ID
router.delete("/:id", auth, async (req, res) => {
    try {
        let itemId = req.params.id
        let userId = req.user.id
        const cart = await Cart.findOne({userId})
        
        await Cart.findOneAndUpdate(
            {userId},
            {$pull: {items: {itemId} }},
            {new: true}
        )

        // const items = cart.items.find(item => item.itemId === itemId)
        // cart.total = 0
        // cart.items.forEach(item => cart.total += item.subtotal)
        // await items.remove()
        // cart.save()

        return res.json({msg: "Item successfully deleted!"})

    } catch(err) {
        return res.json({msg: "No item to be deleted"})
    }
})


// UPDATE ITEM QUANTITY
router.put("/:id", auth, async(req, res) => {
    try{
        const userId = req.user.id // get the user id
        const cart = await Cart.findOne({userId}) // find the user id , cehck if cart exist
        // const product = await Product.findById(itemId)
        const {quantity} = req.body // the quantity body

        // if(quantity > product.quantity) return res.json({msg: "You requesting too much, we dun have"})

        const foundProduct = cart.items.find(item => item.itemId === req.params.id) // find if the itemId is hardly equal to the passed itemId
        if (foundProduct) { // if there is
            cart.total -= (foundProduct.quantity * foundProduct.price) // clear the cart
            foundProduct.quantity = quantity // replace the quantity
            foundProduct.subtotal = (quantity * foundProduct.price) // count the subtotal
            cart.total += foundProduct.quantity * foundProduct.price // do the totals
            await cart.save() // save
            return res.json({msg: "updated wuuhuuuu", cart}) // return
        }

    } catch(err) {
        return res.json({msg: "Not updated!"})
    }
})


// EMPTY CART
router.delete("/", auth, async(req, res) => {
    // find the guy's cart and delete every item
    try {
        let cart = await Cart.findOne({userId: req.user.id})

        cart.items = []
        cart.total = 0
        await cart.save()
        return res.json({msg: "Cart is Empty!"})

    } catch(err) {
        return res.json({msg: "Not deleted!"})
    }
})


module.exports = router