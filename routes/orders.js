const express = require('express')
const router = express.Router()
const Order = require('../models/Order')
const Cart = require('../models/Cart')
const Product = require('../models/Product')
const auth = require('../middleware/auth')

router.post("/", auth, async (req, res) => {
    try{
        const userId = req.user.id // get the user id
        const cart = await Cart.findOne({userId}) // look for cart
        
        if (cart) {
            // Create an order
            await Order.create({
                userId,
                items: cart.items,
                total: cart.total
            })
            
            // Deduct quantity in cart items from quantity availible
            cart.items.forEach(async item => {
                let product = await Product.findById(item.itemId)
                if (product.id === item.itemId) product.quantity -= item.quantity
                await product.save()
            })

            // Delete the cart since you already checked out
            await Cart.findByIdAndDelete({_id: cart.id})
            return res.json({msg: "Check out successfully"})
        }

    } catch(err) {
        return res.status(400).json(err)
    }
})

// GET ALL ORDERS FOR THE USER WHO IS LOGGED IN
// GET ALL ORDERS IF ADMIN
router.get("/", auth, async(req, res) => {
    try {
        if(req.user.isAdmin) {
            let allOrders = await Order.find({})
            return res.json(allOrders)
        } else {
            let orders = await Order.find({userId: req.user.id})
            return res.json({orders})
        }
    } catch(err) {
        return res.json({msg: "No orders!"})
    }
})

module.exports = router