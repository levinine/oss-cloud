var docClient = require("serverless-dynamodb-client").doc;

// params: username
// return: [error, result]
module.exports.checkUsername = username => {
  var params = {
    TableName: "contributors",
    Key: {
      username: username
    }
  };
  return docClient.get(params, function(err, data) {
    if (err) {
      console.log(err);
      return [err, true];
    } else {
      if (Object.keys(data).length === 0) {
        return [null, false];
      } else return [null, true];
    }
  });
};
