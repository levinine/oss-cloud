const _ = require('lodash');
const Ajv = require('ajv');

const ajv = new Ajv();

const { schemas } = require('./shemas.js');


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


module.exports.validateJSON = (data, schemaName) => {
  try {
    const dataObject = JSON.parse(data);
    const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    const validate = ajv.compile(schemas[schemaName]);
    const valid = validate(dataObject);
    if (valid) {
      return [true, null, dataObject];
    }
    return [false, validate.errors, dataObject];
  } catch (e) {
    return [false, 'Invalid JSON object', {}];
  }
};

module.exports.validateObject = (data, schemaName) => {
  const dataObject = data || {};
  const validate = ajv.compile(schemas[schemaName]);
  const valid = validate(dataObject);
  if (valid) {
    return [true, null, dataObject];
  }
  return [false, validate.errors, dataObject];
};
