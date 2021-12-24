require('../models/User')

const mongoose = require('mongoose')
const keys = require('../config/keys')

mongoose.Promise = global.Promise // By default Mongoose does not want to use it's built in promise implementation and it wants you have to tell mongoose what implementation of promises we should use.
mongoose.connect(keys.mongoURI, { useMongoClient: true })
