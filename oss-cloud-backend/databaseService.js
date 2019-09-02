const dynamodb = require('serverless-dynamodb-client');

const docClient = dynamodb.doc;
const rawClient = dynamodb.raw;
const attr = require('dynamodb-data-types').AttributeValue;

module.exports.getContributor = (username) => {
  const params = {
    TableName: 'contributors',
    Key: {
      username,
    },
  };
  return new Promise((resolve, reject) => {
    docClient.get(params, (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(data);
    });
  });
};

module.exports.updateContributorPullRequests = (username, pullRequests) => {
  const params = {
    TableName: 'contributors',
    Key: {
      username,
    },
    UpdateExpression: 'SET contributions = :prs',
    ExpressionAttributeValues: {
      ':prs': pullRequests,
    },
    ReturnValues: 'UPDATED_NEW',
  };
  return new Promise((resolve, reject) => {
    docClient.update(params, (error) => {
      if (error) {
        reject(error);
      }
      resolve(true);
    });
  });
};

module.exports.getAllContributors = () => {
  const params = {
    TableName: 'contributors',
  };
  return new Promise((resolve, reject) => {
    rawClient.scan(params, (error, data) => {
      if (error) reject(error);
      resolve(data.Items.map((item) => attr.unwrap(item)));
    });
  });
};

module.exports.checkUsername = (username) => {
  const params = {
    TableName: 'contributors',
    Key: {
      username,
    },
  };
  return new Promise((resolve, reject) => {
    let retval;
    docClient.get(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        if (Object.keys(data).length === 0) {
          retval = false;
        } else retval = true;
        resolve(retval);
      }
    });
  });
};

// saves contributor object in database
// params: contributor
module.exports.addContributor = (contributor) => {
  const params = {
    TableName: 'contributors',
    Item: contributor,
  };
  return new Promise((resolve, reject) => {
    docClient.put(params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// accepts a list of contributors and extracts a list of their contributions
const extractContributions = (contributorList) => {
  let contributions = [];

  contributorList.forEach((contributor) => {
    contributions = contributions.concat(contributor.contributions);
  });
  return contributions;
};

module.exports.getAllContributions = () => {
  const params = {
    TableName: 'contributors',
  };
  return new Promise((resolve, reject) => {
    rawClient.scan(params, (error, data) => {
      if (error) reject(error);
      resolve(extractContributions(data.Items.map((item) => attr.unwrap(item))));
    });
  });
};
