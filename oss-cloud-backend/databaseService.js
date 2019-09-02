var docClient = require("serverless-dynamodb-client").doc;

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
