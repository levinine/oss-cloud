const Ajv = require('ajv');

const ajv = new Ajv();

const { schemas } = require('./shemas.js');


module.exports.generateResponse = (status, body, stringify = true) => ({
  statusCode: status,
  headers: { 'Access-Control-Allow-Origin': '*' },
  body: stringify ? JSON.stringify(body) : body,
});


module.exports.validateJSON = (data, schemaName) => {
  try {
    const dataObject = JSON.parse(data);
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
