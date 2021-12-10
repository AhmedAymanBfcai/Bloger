const mongoose = require('mongoose')

const exec = mongoose.Query.prototype.exec // To get a reference to the existing default exec function that is defined on a mongoose query.

mongoose.Query.prototype.exec = function () {
  console.log('I am from CACHE.')
  console.log(this.getQuery()) // this refers to the a reference to the current query that we are trying to execute.
  return exec.apply(this, arguments)
}
