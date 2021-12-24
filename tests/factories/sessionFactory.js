const Buffer = require('safe-buffer').Buffer
const keygrip = require('keygrip')
const keys = require('../../config/keys')
const keygrip = new keygrip([keys.cookieKey])

module.exports = (user) => {
  const sessionObject = {
    passport: {
      user: user._id.toString(), // The Mongoose model id property is not actually a string. It's a Javascript object that contains the user's ID. so before we try to stringify it to a JSON we have to ensure that we have turend that object into a string.
    },
  }
  const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64')
  const sig = keygrip.sign('session=' + session)

  return { session, sig }
}
