const gitHubApiService = require('./services/gitHubApiService.js');
const databaseService = require('./services/databaseService.js');


module.exports.getAllContributorsAndCount = async (event) => {
  try {
    const {
      sortBy, sortDesc, page, itemsPerPage, searchParam,
    } = event.queryStringParameters;
    const [contributors, [contributorsCount]] = await databaseService.getContributorsPaging({
      sortBy,
      sortDesc: sortDesc === 'true',
      page: parseInt(page, 10),
      itemsPerPage: parseInt(itemsPerPage, 10),
      searchParam,
    });
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          contributors,
          contributorsCount: contributorsCount['COUNT(*)'],
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
  let body;
  let response;
  try {
    // TODO create generic function for checking validity of a body
    body = JSON.parse(event.body);
    if (Object.keys(body).length !== 3) {
      throw new Error('Invalid number of attributes in JSON');
    }
  } catch (err) {
    console.log(err);
    response = {
      statusCode: 400,
      body: JSON.stringify({ message: err.message }),
    };
    return response;
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
    // TODO: call scheduler
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

module.exports.getContributions = async () => {
  let response;
  try {
    const contributions = await databaseService.getAllContributions();
    response = {
      statusCode: 200,
      body: JSON.stringify(contributions),
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
