const { clearHash } = require('../services/cache')

module.exports = async (req, res, next) => {
  await next() // To allow handlers to run first, We're going to wait for that to execute. And we do that so we need our cash to be created until teh blog post has been successfully created not before.

  clearHash(req.user.id) //Cleaning our cache.
}
