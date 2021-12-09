// get the package
require('dotenv').config()  // config is a function that runs dotenv
const {PORT, DB_NAME, DB_PASSWORD, DB_HOST, DB_PORT} = process.env // object destructuring

const express = require('express')
const app = express() // initial express in variable 'app'

const cors = require('cors')
const mongoose = require('mongoose')


app.use(cors())
app.use(express.json())


// DB connection //Local DB
// mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`)

// online DB
mongoose.connect('mongodb+srv://yoj:yoj@cluster0.nvdoi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
mongoose.connection.once('open', () => console.log('connected to MongoDB'))

// connect to postman
app.use(express.static(__dirname + '/public/'))
app.use('/auth', require('./routes/auth'))
app.use('/products', require('./routes/products'))
app.use(express.static('public')) //localhost:4000/public/image
app.use('/cart', require('./routes/carts'))
app.use("/orders", require('./routes/orders'))

// access method 'listen' , if the port is running do cconsole log
app.listen(process.env.PORT, () => console.log(`Server is running in port ${PORT}`))
// run nodemon to check (nodemon server) server because we are doing it in server.js
