require('dotenv').config()

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
// var compression = require('compression')
const routes = require('./routes')

mongoose.Promise = Promise
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log('Connected to Mongo!')
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  })

const app = express()
app.use(express.json())
//app.use(compression())
app.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Origin',
    `http://localhost: ${process.env.PORT}`
  )
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})
app.use(express.static(path.join(__dirname, 'public')))
app.use(routes)

app.listen(process.env.PORT, () => {
  console.log(`Server is up and running: http://localhost:${process.env.PORT}`)
})
