// So you can `var request = require("superagent-interface-promise")`
var superagent = module.exports = require("superagent");

function getLocalPromise() {
  var local;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      return null;
    }
  }

  var P = local.Promise;
  if (!isPromise(P)) {
    return null;
  }

  return P;
}


superagent.Promise = getLocalPromise();
var Request = superagent.Request;

// Create custom error type.
// Create a new object, that prototypally inherits from the Error constructor.
var SuperagentPromiseError = superagent.SuperagentPromiseError = function (message) {
  this.name = 'SuperagentPromiseError';
  this.message = message || 'Bad request';
};

SuperagentPromiseError.prototype = new Error();
SuperagentPromiseError.prototype.constructor = SuperagentPromiseError;


function isPromise(obj) {
  return obj && 'function' == typeof obj.all;
}

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
  if (!isPromise(superagent.Promise)) {
    throw new Error('Promise no exist');
  }

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
