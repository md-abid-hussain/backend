const prisma = require('../prisma/prisma')

const createTicketCounter = async ()=>{
    const counter = await prisma.ticketCounter.create({
        data:{
            ticketNum:500,
        }
    })

    return counter
}

const addTicketNum = async (req,res,next)=>{
    const counterNum = await prisma.ticketCounter.findFirst()
    if(!counterNum){
        req.body.ticketNum = createTicketCounter()
        return next()
    }
    const id = counterNum.id
    let ticketNum = counterNum.ticketNum
    const updatedCounter = await prisma.ticketCounter.update({
        where:{
            id:id
        },
        data:{
            ticketNum:ticketNum+1
        }
    })
    req.body.ticketNum = updatedCounter.ticketNum
    next();
}

module.exports = addTicketNum