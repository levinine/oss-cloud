var dynamodb = require("serverless-dynamodb-client");
var rawClient = dynamodb.raw;
var docClient = dynamodb.doc;
var attr = require("dynamodb-data-types").AttributeValue;

module.exports.getAllContributors = () => {
  const params = {
    TableName: "contributors"
  };
  return new Promise((resolve, reject) => {
    rawClient.scan(params, (error, data) => {
      if (error) reject(error);
      resolve(data.Items.map(item => attr.unwrap(item)));
    });
  });
};

// checks if username is already in use in database
// params: username
// return: Promise bool
module.exports.checkUsername = username => {
  var params = {
    TableName: "contributors",
    Key: {
      username: username
    }
  };
  return new Promise((resolve, reject) => {
    docClient.get(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        if (Object.keys(data).length === 0) resolve(false);
        resolve(true);
      }
    });
  });
};

// saves contributor object in database
// params: contributor
module.exports.addContributor = contributor => {
  var params = {
    TableName: "contributors",
    Item: contributor
  };
  return new Promise((resolve, reject) => {
    docClient.put(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
