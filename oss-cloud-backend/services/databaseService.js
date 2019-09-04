const mysql = require('serverless-mysql')({
  config: {
    host: process.env.ENDPOINT,
    port: process.env.PORT,
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD,
  },
});

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

module.exports.insertPullRequests = (pullRequests) => {
  const prs = pullRequests.map((pr) => [
    pr.repo,
    pr.owner,
    pr.number,
    pr.link,
    pr.title,
    pr.dateCreated,
    pr.status,
    pr.author,
  ]);
  const m = mysql.query('INSERT INTO contributions (repo, owner, number, link, title, dateCreated, status, author) VALUES ?', [prs]);
  return m;
};

module.exports.getAllContributors = async () => mysql.query(
  'SELECT * FROM contributors',
);

module.exports.checkUsername = (username) => {
  const params = {
    TableName: 'contributors',
    Key: {
      username,
    },
  };
  return new Promise((resolve, reject) => {
    docClient.get(params, (err, data) => {
      if (err) {
        reject(err);
      }
      if (Object.keys(data).length === 0) {
        resolve(false);
      }
      resolve(true);
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

module.exports.getContributorPullRequests = (username) => mysql.transaction()
  .query('SELECT * FROM contributions WHERE author=?', [username])
  .rollback((e) => { throw e; })
  .commit();
