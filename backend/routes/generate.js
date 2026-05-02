const express = require('express')
const router = express.Router()
const controller = require('../controllers/generateController')

router.post('/generate', controller.generateReplies)
router.post('/generate-opener', controller.generateOpener)

module.exports = router
