const prisma = require('../prisma/prisma')

const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc Get All User
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req,res)=>{
    const users = await prisma.user.findMany({
        select:{
            id:true,
            username:true,
            role:true,
            active:true
        }
    })
    if(!users.length){
        return res.status(404).json({
            message:"No user found"
        })
    }
    
    res.json(users)
})

// @desc Create new User
// @route POST /users
// @access Private
const createUser = asyncHandler(async(req,res)=>{
    const {username,password,role} = req.body

    if(!username || !password  || !Array.isArray(role) || !role.length){
        return res.status(400).json({message:"All fields are required"})
    }

    const duplicate  = await prisma.user.findFirst({
        where:{
            username:{
                equals:username,
                mode:'insensitive'
            }
        }
    })
    if (duplicate){
        return res.status(409).json({message:`${username} already exist`})
    }
    // Hash Password
    const hashedPassword = await bcrypt.hash(password,10)

    // Create and store user
    const user = await prisma.user.create({
        data:{
            username:username,
            password:hashedPassword,
            role:role
        }
    })

    if(user){
        res.status(201).json({message:`new user ${username} created`})
    }else{
        res.status(400).json({message:"Invalid user data recieved"})
    }
})

// @desc Update User
// @route PATCH /users
// @access Private
const updateUser = async (req,res)=>{
    const {id,username,active,role} = req.body
    let {password} = req.body

    if(!id || !username || !Array.isArray(role) || !role.length || typeof active !=="boolean"){
        return res.status(400).json({message:"All fields are required"})
    }

    const user = await prisma.user.findUnique({
        where:{
            id:id
        }
    })

    if(!user){
        return res.status(400).json({
            message:`user ${username} does not exist`
        })
    }
    
    const duplicate = await prisma.user.findFirst({
        where:{
            username:{
                equals:username,
                mode:'insensitive'
            }
        }
    })

    if(duplicate && duplicate.id!==id){
        return res.status(409).json({
            message:"Duplicate username"
        })
    }

    if(password){
        password = await bcrypt.hash(password,10)
    }else{
        password = user.password
    }

    const updatedUser = await prisma.user.update({
        where:{
            id:id
        },
        data:{
            username:username,
            role:role,
            active:active,
            password:password        
        },
        select:{
            id:true,
            username:true,
            role:true,
            active:true
        }
    })

    res.json(updatedUser)
}

// // @desc Delete A user
// // @route DELETE /users
// // @access Private
const deleteUser = asyncHandler(async (req,res)=>{
    const {id} = req.body

    if(!id){
        return res.status(400).json({
            message:"Id is required"
        })
    }

    const user = await prisma.user.findUnique({
        where:{
            id:id
        }
    })

    if(!user){
        return res.status(400).json({
            message:`user with id ${id} does not exist` 
        })
    }

    const deletedUser = await prisma.user.delete({
        where:{
            id:id
        }
    })

    res.json({
        message:`user with id ${id} deleted`
    })
})

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
}