const prisma = require('../prisma/prisma')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

// @desc Login
// @route POST /auth
// @access Public 
const login = asyncHandler(async (req,res)=>{
    const {username, password} = req.body;

    if(!username || !password){
        return res.status(400).json({message:'All fields are required'})
    }

    const foundUser = await prisma.user.findUnique({
        where:{
            username:username
        }
    })

    if(!foundUser || !foundUser.active){
        return res.status(400).json({message:`User ${username} does not exist`})
    }

    const match = await bcrypt.compare(password,foundUser.password)

    if(!match){
        return res.status(401).json({message:'Invalid credentials'})
    }

    const accessToken = jwt.sign(
        {
            "UserInfo":{
                "username":foundUser.username,
                "roles":foundUser.role
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:'10s'}
    )

    const refreshToken = jwt.sign(
        {"username":foundUser.username},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:'1d'}
    )

    // create secure cookie
    res.cookie('jwt',refreshToken,{
        httpOnly:true, // accessible only by web server
        secure:true, // https
        sameSite:'None', // cross-site cookie
        maxAge:7*24*60*60*1000
    })

    res.json({accessToken})
})

// @desc Refresh
// @route GET /auth/refresh
// @access Public 
const refresh = asyncHandler(async (req,res)=>{
    const cookies = req.cookies

    if(!cookies?.jwt){
        return res.status(400).json({message:"unauthorized"})
    }

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err,decoded)=>{
            if(err){
                return res.status(403).json({message:'forbidden'})
            }

            const foundUser = await prisma.user.findUnique({
                where:{
                    username:decoded.username
                }
            })

            if(!foundUser){
                return res.status(401).json({message:'unaithorized'})
            }
            
            const accessToken = jwt.sign(
                {
                    "UserInfo":{
                        "username":foundUser.username,
                        "role":foundUser.role
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn:'10s'}
            )

            res.json({accessToken})
        })
    )
})

// @desc Logout
// @route POST /auth/logout
// @access Public 
const logout = asyncHandler(async (req,res)=>{
    const cookies = req.cookies

    if(!cookies?.jwt){
        return res.sendStatus(204)
    }

    res.clearCookie('jwt',{httpOnly:true,secure:true,sameSite:'None'})

    res.json({message:'logout'})
})

module.exports = {
    login,
    refresh,
    logout
}