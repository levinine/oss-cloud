var dynamodb = require("serverless-dynamodb-client")
var docClient = dynamodb.doc;
var rawClient = dynamodb.raw;
var attr = require('dynamodb-data-types').AttributeValue;



module.exports.getContributor = (username) => {
  const params = {
    TableName: "contributors",
    Key: {
      username: username
    }
  };
  return new Promise((resolve, reject) => {
    docClient.get(params, (error, data) => {
        if (error) {
            reject(error);
        }
        resolve(data);
    });
  })
}


module.exports.updateContributorPullRequests = (username, pullRequests) => {
  const params = {
    TableName: "contributors",
    Key: {
        username: username
    },
    UpdateExpression: 'SET contributions = :prs',
    ExpressionAttributeValues: {
        ':prs': pullRequests
    },
    ReturnValues: 'UPDATED_NEW'
  }
  return new Promise((resolve, reject) => {
    docClient.update(params, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(true);
    })
  })
}

module.exports.getAllContributors = () => {
    const params = {
        TableName: 'contributors',
    };
    return new Promise((resolve, reject) => {
        rawClient.scan(params, (error, data) => {
            if (error) {
              reject(error)
            }
            resolve(data.Items.map((item) => attr.unwrap(item)))
        })
    })
}


module.exports.checkUsername = username => {
  var params = {
    TableName: "contributors",
    Key: {
      username: username
    }
  };
  return new Promise((resolve, reject) => {
    let retval;
    docClient.get(params, function(err, data) {
      if (err) {
        reject(err)
      }
      if (Object.keys(data).length === 0) {
        resolve(false)
      }
      resolve(true)
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
    let retval;
    docClient.put(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
