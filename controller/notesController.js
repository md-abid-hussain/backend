const prisma = require('../prisma/prisma')

const asyncHandler = require('express-async-handler')

// @desc Get All Notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req,res)=>{
    const notes = await prisma.note.findMany()
    if(!notes.length){
        return res.status(400).json({message:"Notes not found"})
    }

    const notesWithUser = await Promise.all(notes.map(async (note)=>{
        const user = await prisma.user.findUnique({
            where:{
                id:note.userId
            }
        })
        note.username = user.username
        return note
    }))
    res.json(notesWithUser)
})

// @desc Get All Notes
// @route GET /notes
// @access Private
const createNote = asyncHandler(async (req,res)=>{
    const {userId,title,text,ticketNum} = req.body

    if(!userId || !title || !text){
        return res.status(400).json({message:"All fields are required"})
    }

    const userExist = await prisma.user.findUnique({
        where:{
            id:userId
        }
    })

    if(!userExist){
        return res.status(400).json({message:"User does not exist"})
    }

    const duplicateTitle = await prisma.note.findUnique({
        where:{
            title:title
        }
    })

    if(duplicateTitle){
        return res.status(400).json({message:"Duplicate title"})
    }

    const note = await prisma.note.create({
        data:{
            userId:userId,
            ticketNum:ticketNum,
            title:title,
            text:text
        }
    })

    if(note){
        return res.json({message:`Note created`})
    }else{
        res.status(400).json({message:"Invalid notes data received"})
    }
})

// @desc Update a Note
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req,res)=>{
    const {id,title,text,completed} = req.body
    
    if(!id || !title ||!text || typeof completed !== 'boolean'){
        return res.status(400).json({
            message:"All fields are required"
        })
    }

    const duplicateTitle = await prisma.note.findUnique({
        where:{
            title:title
        }
    })

    if(duplicateTitle && duplicateTitle.id !== id){
        return res.status(409).json({
            message:"Duplicate title"
        })
    }

    const updatedNote = await prisma.note.update({
        where:{
            id:id
        },
        data:{
            title:title,
            text:text,
            completed:completed
        }
    })

    if(updatedNote){
        return res.json(updatedNote)
    }
    res.status(400).json({message:"Invalid note data"})
})

// @desc Delete a Note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req,res)=>{
    const {id} = req.body

    if(!id){
        return res.status(400).json({
            message:"Note id is required"
        })
    }

    const deletedNote = await prisma.note.delete({
        where:{
            id:id
        }
    })

    res.json({message:`Note with id ${id} deleted`})
})

module.exports = {
    getAllNotes,
    createNote,
    updateNote,
    deleteNote
}