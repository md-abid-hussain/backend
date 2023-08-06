const mongoose = require('mongoose')
const {Schema} = mongoose

const noteSchema = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    title:{
        type:String,
        required:true
    },
    role:[{
        type:String,
        default:"Employee"
    }],
    active:{
        type:Boolean,
        default:true
    }
})

module.exports = mongoose.model('Note',noteSchema)