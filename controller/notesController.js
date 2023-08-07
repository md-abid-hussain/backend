const Note = require('../model/Note')
const User = require('../model/User')

const asyncHandler = require('express-async-handler')

// @desc Get All Notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req,res)=>{
    const notes = await Note.find()
    if(!notes.length){
        return res.status(400).json({message:"Notes not found"})
    }
    res.json(notes)
})

// @desc Get All Notes
// @route GET /notes
// @access Private
const createNote = asyncHandler(async (req,res)=>{
    const {user,title,text,} = req.body
    console.log(req.body)

    if(!user || !title || !text){
        return res.status(400).json({message:"All fields are required"})
    }

    const userExist = await User.findById(user).exec()
    console.log(userExist)

    if(!userExist){
        return res.status(400).json({message:"User does not exist"})
    }

    const note = await Note.create({user,title,text})

    console.log(note)

    if(note){
        return res.json({message:`Note created`})
    }else{
        res.status(400).json({message:"Invalid notes data received"})
    }
})

module.exports = {
    getAllNotes,
    createNote
}