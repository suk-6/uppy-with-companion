const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const companion = require('@uppy/companion')
const crypto = require('crypto');

require('dotenv').config();

const app = express()

const secret = crypto.randomBytes(64).toString('hex');

app.use(bodyParser.json())
app.use(session({
  secret: secret,
  resave: true,
  saveUninitialized: true,
}))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.clientUrl)
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  next()
})

// Routes
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send('Welcome to Companion')
})

// initialize uppy
const companionOptions = {
  providerOptions: {
    drive: {
      key: process.env.driveKey,
      secret: process.env.driveSecret,
    },
    dropbox: {
      key: process.env.dropboxKey,
      secret: process.env.dropboxSecret,
    },
  },
  server: {
    host: process.env.companionHost,
    protocol: process.env.companionProtocol,
  },
  filePath: '/tmp',
  secret: secret,
  debug: true,
  corsOrigins: process.env.clientUrl,
  COMPANION_PORT: 30002
}

const { app: companionApp } = companion.app(companionOptions);
app.use(companionApp);

// handle 404
app.use((req, res) => {
  return res.status(404).json({ message: 'Not Found' })
})

// handle server errors
app.use((err, req, res) => {
  console.error('\x1b[31m', err.stack, '\x1b[0m')
  res.status(err.status || 500).json({ message: err.message, error: err })
})

companion.socket(app.listen(30002))

console.log('Welcome to Companion!')
console.log(`Listening Server`)
