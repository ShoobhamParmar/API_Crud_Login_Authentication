const mongoose = require('mongoose')
let userSchema= new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    name:String,
    password:String,
    email:String,
    address:String,
    image: String,
    role:{"type":String,"num":["ADMIN", "GENERAL"]}
})

module.exports=mongoose.model('Users',userSchema)