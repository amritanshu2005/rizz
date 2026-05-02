// Simple Express server for RIZZ AI Assistant
// - Provides POST /generate which returns 5 short replies
// - Uses Google Gemini if GEMINI_API_KEY present, otherwise returns mock replies

require('dotenv').config()
const express = require('express')
const cors = require('cors')

const generateRoutes = require('./routes/generate')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000

app.use('/', generateRoutes)

app.listen(PORT, () => {
  console.log(`RIZZ backend running on http://localhost:${PORT}`)
})
