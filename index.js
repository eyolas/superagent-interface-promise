// So you can `var request = require("superagent-es6-promise")`
var superagent = module.exports = require("superagent");
superagent.Promise = Promise;
var Request = superagent.Request;

// Create custom error type.
// Create a new object, that prototypally inherits from the Error constructor.
var SuperagentPromiseError = superagent.SuperagentPromiseError = function (message) {
  this.name = 'SuperagentPromiseError';
  this.message = message || 'Bad request';
};

SuperagentPromiseError.prototype = new Error();
SuperagentPromiseError.prototype.constructor = SuperagentPromiseError;

/**
 * @namespace utils
 * @class Superagent
 */

/**
 *
 * Add promise support for superagent/supertest
 *
 * Call .promise() to return promise for the request
 *
 * @method then
 * @return {Promise}
 */
Request.prototype.promise = function() {
  var req = this;
  var error;

  return new superagent.Promise(function(resolve, reject) {
      req.end(function(err, res) {
        if (err) {
          error = new SuperagentPromiseError(err);
          if (res) {
            error.status = res.status;
            error.body = res.body;
            error.res = res;
          }
          reject(error);
        } else {
          resolve(res);
        }
      });
    });
};

/**
 *
 * Make superagent requests Promises/A+ conformant
 *
 * Call .then([onFulfilled], [onRejected]) to register callbacks
 *
 * @method then
 * @param {function} [onFulfilled]
 * @param {function} [onRejected]
 * @return {Bluebird.Promise}
 */
Request.prototype.then = function() {
  var promise = this.promise();
  return promise.then.apply(promise, arguments);
};
