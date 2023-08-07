const express = require('express')
const router = express.Router()
const notesController = require('../controller/notesController')

router.route('/')
    .get(notesController.getAllNotes)
    .post(notesController.createNote)
    // .patch()
    // .delete()

module.exports = router