const User = require('../model/User')
const Note = require('../mode/Note')

const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc Get All User
// @route GET /users
// @access Private
const getAllUsers =  asyncHandler(async (req,res)=>{
    const users = await User.find().select('-password').lean();
    if(!users){
        return res.status(400).json({message:'No user found'})
    }
    res.json(users)
})

// @desc Create new User
// @route POST /users
// @access Private
const createUser =  asyncHandler(async (req,res)=>{
    const {username,password,roles} = req.body

    // Confirm data
    if(!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).json({
            message:"All fields are required"
        })
    }

    // Check for duplicates
    const duplicate  = await User.findOne({username}).lean().exec()
    if (duplicate){
        return res.status(409).json({message:`${username} already exist`})
    }
    // Hash Password
    const hashedPassword = await bcrypt.hash(password,10)

    const userObj = {username,password:hashedPassword,roles}

    // Create and store user

    const user = await User.create(userObj)

    if(user){
        res.status(201).json({message:`new user ${username} created`})
    }else{
        res.status(400).json({message:"Invalid user data recieved"})
    }
})

// @desc Update User
// @route PATCH /users
// @access Private
const updateUser =  asyncHandler(async (req,res)=>{
    const {id,username,active,roles,password} = req.body

    // Confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || !typeof active !== 'boolean'){
        return res.status(400).json({message:"All fields are required"})
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({message:'user not found'})
    }

    // Check for duplicates
    const duplicate = await User.findOne({username}).lean().exec()
    // Allow updates to the original user
    if (!duplicate  && duplicate?._id.toString() !== id){
         return res.status(409).json({message:"Duplicate username"})
    }

    user.username = username
    user.roles = roles
    user.active  = active

    if(password){
        // Hash Password
        user.password = await bcrypt.hash(password,10)
    }

    const updatedUser = await user.save()

    res.json({message:`${updateUser.username} is updated`})
})

// @desc Delete A user
// @route DELETE /users
// @access Private
const deleteUser =  asyncHandler(async (req,res)=>{
    const {id} = req.body

    if(!id){
        return res.status(400).json({message:"User id required"})
    }

    const notes = await Note.findOne({user:id}).lean().exec()

    if(notes?.length){
        return res.status(400).json({message:"User has assigned notes"})
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({message:`User with ${id} does not exist`})
    }

    const result = await user.deleteOne()
    const reply = `Username ${result.username} with id ${result._id} deleted`

    res.json({message:reply})
})

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
}