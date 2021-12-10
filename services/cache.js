const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')

const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl)
client.get = util.promisify(client.get)
const exec = mongoose.Query.prototype.exec // To get a reference to the existing default exec function that is defined on a mongoose query.

mongoose.Query.prototype.exec = async function () {
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  )
  // See If we have a value for 'key' in redis
  const cacheValue = await client.get(key)

  // If we do, return that
  if (cacheValue) {
    const doc = JSON.parse(cacheValue) // Anything comes from redis is in JSON from so we need to convert the JSON to object.
    return Array.isArray(doc) // We may fetch a single object or an array of object so we have to check!
      ? doc.map((d) => new this.model(d)) // When we need to fetch an array we have to map array elemetns (records) to return a document instance. We creating new instance form the reference for the query we need (this).
      : new this.model(doc) //When we need to fetch an object.
  }

  // Otherwise, Issue that query and store that result in redis.

  const result = await exec.apply(this, arguments)
  client.set(key, JSON.stringify(result))

  return result
}
