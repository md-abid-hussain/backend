require('dotenv').config()
const express = require('express')
const {logger, logEvents} = require('./middleware/logEvent')
const path = require('path')
const errorHandler = require('./middleware/logError')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOption')
const connectDB = require('./config/dbConfig')
const mongoose = require('mongoose')

const port = process.env.PORT || 3500;
const app = express()

console.log(process.env.NODE_ENV)

connectDB()

app.use(logger)
app.use(cors(corsOptions))
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname,"public")))

app.use('/',require('./routes/root'))
app.use('/users',require('./routes/userRoutes'))

app.use('*',(req,res)=>{
    res.status(404)
    if(req.accepts('html')){
        return res.sendFile(path.join(__dirname,'view','404.html'))
    }else if(req.accepts('application/json')){
        return res.json({"message":"requested resource does not exist"})
    }else{
        res.type('txt').send('Requested resource does not exist')
    }
})

app.use(errorHandler)

mongoose.connection.once('open',()=>{
    console.log('Connected to Database')
    app.listen(port,()=>{
        console.log(`Server is running on port ${port}`)
    })
})

mongoose.connection.on('error',(err)=>{
    console.log(err);
    logEvents(`${err.no} : ${err.code}\t${err.syscall}\t${err.hostname}`,'mongoErrorLog.log')
})
