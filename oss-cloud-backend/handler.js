const gitHubApiService = require('./services/gitHubApiService.js');
const databaseService = require('./services/databaseService.js');
const utility = require('./services/utility.js');


module.exports.getContributors = async (event) => {
  try {
    const {
      sortBy, sortDesc, page, itemsPerPage, searchParam, showHidden,
    } = event.queryStringParameters;
    const [contributors, [contributorsLength]] = await databaseService.getContributorsPaging({
      sortBy,
      sortDesc: sortDesc === 'true',
      page: parseInt(page, 10),
      itemsPerPage: parseInt(itemsPerPage, 10),
      searchParam,
      showHidden: showHidden === 'true',
    });
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          contributors,
          contributorsLength: contributorsLength['COUNT(*)'],
        },
      ),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err.message,
        success: false,
      }),
    };
  }
};

// add a contributor to database if he does not already exist and is registered on GitHub
// POST expected json
// {
//    username: string
//    firstName: string
//    lastName: string
// }
module.exports.addContributor = async (event) => {
  // check if request is valid
  const [valid, message, body] = utility.checkBody(event.body, ['username', 'firstName', 'lastName']);
  if (!valid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message }),
    };
  }

  try {
    if (await databaseService.checkUsername(body.username)) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: 'Username is already registered on this platform',
          success: false,
        }),
      };
    }
    if (!(await gitHubApiService.checkUsername(body.username))) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'Username does not exist on GitHub',
          success: false,
        }),
      };
    }
    await databaseService.addContributor({
      username: body.username,
      firstName: body.firstName,
      lastName: body.lastName,
      link: `https://github.com/${body.username}`,
      visibleContributionCount: 0,
    });

    gitHubApiService.getContributorPullRequests(body.username)
      .catch((err) => { console.log(err); });

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Successfully added contributor',
        success: true,
      }),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err.message,
        success: false,
      }),
    };
  }
};

// returns all pull requests from parents of all forked repos for a single github user
// POST expected json
// {
//    username: string
// }
module.exports.updatePullRequests = async () => {
  let response;
  try {
    const results = await gitHubApiService.updatePullRequests();
    response = {
      statusCode: 200,
      body: `${results} contributors updated`,
    };
  } catch (error) {
    console.log('error in getPullRequests handler: ', error);
    response = {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
  return response;
};

module.exports.getContributions = async (event) => {
  const {
    sortBy, sortDesc, page, itemsPerPage,
  } = event.queryStringParameters;
  let response;
  try {
    const [contributions, [contributionsLength]] = await databaseService.getContributionsPaging({
      sortBy,
      sortDesc: sortDesc === 'true',
      page: parseInt(page, 10),
      itemsPerPage: parseInt(itemsPerPage, 10),
    });
    response = {
      statusCode: 200,
      body: JSON.stringify({
        contributions,
        contributionsLength: contributionsLength['COUNT(*)'],
      }),
    };
  } catch (error) {
    console.log('error in getContributions handler');
    response = {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
  return response;
};


module.exports.updateContributionStatus = async (event) => {
  const [valid, message, body] = utility.checkBody(event.body, ['status', 'contribution']);
  if (!valid) {
    const response = {
      status: 400,
      body: JSON.stringify({
        message,
      }),
    };
    return response;
  }

  if (['Pending', 'Visible', 'Hidden'].indexOf(body.status) === -1) {
    const response = {
      status: 400,
      body: JSON.stringify({
        message: 'Invalid contributions status',
      }),
    };
    return response;
  }

  const result = await databaseService.updateContributionStatus(body.status,
    body.contribution.id, body.contribution.author);
  const response = {
    status: 200,
    body: JSON.stringify({
      message: result,
    }),
  };
  return response;
};


// Returns all contributions of given contributor
module.exports.getUserContributions = async (event) => {
  const [valid, message, body] = utility.checkBody(event.body, ['username']);
  if (!valid) {
    return {
      status: 400,
      body: JSON.stringify({
        message,
      }),
    };
  }

  const result = await databaseService.getContributorPullRequests(body.username);
  const response = {
    status: 200,
    body: JSON.stringify(result),
  };
  return response;
};

// Returns visible contributions for single contributor
module.exports.getVisibleUserContributions = async (event) => {
  const [valid, message, body] = utility.checkBody(event.body, ['username']);
  if (!valid) {
    return {
      status: 400,
      body: JSON.stringify({
        message,
      }),
    };
  }

  const result = await databaseService.getVisibleContributorPullRequests(body.username);
  const response = {
    status: 200,
    body: JSON.stringify(result),
  };
  return response;
};
