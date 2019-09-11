const _ = require('lodash');

// checks if body can be parsed with JSON and contains required attributes
// returns boolean valid, error or succes message, and parsed body
module.exports.checkBody = (body, attributes) => {
  try {
    const bodyObject = JSON.parse(body);
    if (_.isEqual(Object.keys(bodyObject), attributes)) {
      return [true, 'Body is valid', bodyObject];
    }
    return [false, 'Attributes not matching', {}];
  } catch (e) {
    return [false, e.message, {}];
  }
};

module.exports.generateResponse = (status, body, stringify = true) => ({
  statusCode: status,
  headers: { 'Access-Control-Allow-Origin': '*' },
  body: stringify ? JSON.stringify(body) : body,
});
