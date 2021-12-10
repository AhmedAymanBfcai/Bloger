const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')

const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl)
client.hget = util.promisify(client.hget)
const exec = mongoose.Query.prototype.exec // To get a reference to the existing default exec function that is defined on a mongoose query.

mongoose.Query.prototype.cache = function (options = {}) {
  // We have to use a keyword functio when we need a to create a function and does not use arrow function as we will miss the value of this.
  this.useCache = true // this equals to the query instance.
  this.hashKey = JSON.stringify(options.key || '') // As the kay has to be number or string. To Indicate the top level hash key.

  return this // To make sure that this function is chainable one so we can execute in chain in every single query.
}

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache === false) {
    return exec.apply(this, arguments)
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  )
  // See If we have a value for 'key' in redis
  const cacheValue = await client.hget(this.hashKey, key)

  // If we do, return that
  if (cacheValue) {
    const doc = JSON.parse(cacheValue) // Anything comes from redis is in JSON from so we need to convert the JSON to object.
    return Array.isArray(doc) // We may fetch a single object or an array of object so we have to check!
      ? doc.map((d) => new this.model(d)) // When we need to fetch an array we have to map array elemetns (records) to return a document instance. We creating new instance form the reference for the query we need (this).
      : new this.model(doc) //When we need to fetch an object.
  }

  // Otherwise, Issue that query and store that result in redis.

  const result = await exec.apply(this, arguments)
  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10) //EX refers to expire that mean that the query will cached in redis in just ten seconds.

  return result
}

module.exports = {
  // To delete data that is nested on a particular hash key.
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey)) // To delete all the information associated with the give keyword
  },
}
