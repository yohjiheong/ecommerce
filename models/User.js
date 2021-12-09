const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {isEmail} = require('validator')

const UserSchema = new Schema({
    fullname: {type: String},
    isAdmin: {type: Boolean, default: false},
    email: {type: String, isValid: [isEmail, 'Enter a valid email lah']},
    password: {type: String},
    password2: {type: String}
})

module.exports = mongoose.model('User', UserSchema)