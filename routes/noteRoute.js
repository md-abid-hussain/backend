const express = require('express')
const router = express.Router()
const notesController = require('../controller/notesController')
const addTicketNum = require('../middleware/addTicketNum')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(notesController.getAllNotes)
    .post(addTicketNum,notesController.createNote)
    .patch(notesController.updateNote)
    .delete(notesController.deleteNote)

module.exports = router