const express = require('express')
const mongoose = require('mongoose')
const cookieSession = require('cookie-session') //It handles authentication and maintenance of sessions for incoming requests.
const passport = require('passport')
const bodyParser = require('body-parser') // bodyParser parses the body of post requests that come into the application.
const keys = require('./config/keys')

require('./models/User')
require('./models/Blog')
require('./services/passport')
require('./services/cache')

mongoose.Promise = global.Promise
mongoose.connect(keys.mongoURI, { useMongoClient: true })

const app = express()

app.use(bodyParser.json())
app.use(
  cookieSession({
    // cookieSession is responsible for maintaining a session on incoming request.
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey],
  })
)
app.use(passport.initialize())
app.use(passport.session())

require('./routes/authRoutes')(app) // To handle authentication in our app. (the entiere google oauth process)
require('./routes/blogRoutes')(app)

if (['production'].includes(process.env.NODE_ENV)) {
  app.use(express.static('client/build'))

  const path = require('path')
  app.get('*', (req, res) => {
    res.sendFile(path.resolve('client', 'build', 'index.html'))
  })
}

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Listening on port`, PORT)
})
