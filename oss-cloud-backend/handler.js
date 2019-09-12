const gitHubApiService = require('./services/gitHubApiService.js');
const databaseService = require('./services/databaseService.js');
const utility = require('./services/utility.js');


module.exports.getContributors = async (event) => {
  try {
    const {
      sortBy, sortDesc, page, itemsPerPage, searchParam, showHidden,
    } = event.queryStringParameters || {};

    const [contributors, [contributorsLength]] = await databaseService.getContributorsPaging({
      sortBy: typeof (sortBy) === 'string' ? sortBy : 'username',
      sortDesc: sortDesc === 'true',
      page: page ? parseInt(page, 10) : 1,
      itemsPerPage: itemsPerPage ? parseInt(itemsPerPage, 10) : 13,
      searchParam: searchParam || '',
      showHidden: showHidden === 'true', // can be later changed to show hidden only if admin invoked this lambda
    });

    return utility.generateResponse(200, {
      contributors,
      contributorsLength: contributorsLength['COUNT(*)'],
    });
  } catch (err) {
    console.log(err);
    return utility.generateResponse(500, {
      message: err.message,
      success: false,
    });
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
    return utility.generateResponse(400, { message });
  }

  try {
    if (await databaseService.checkUsername(body.username)) {
      return utility.generateResponse(409, {
        message: 'Username is already registered on this platform',
        success: false,
      });
    }
    if (!(await gitHubApiService.checkUsername(body.username))) {
      return utility.generateResponse(404, {
        message: 'Username does not exist on GitHub',
        success: false,
      });
    }
    await databaseService.addContributor({
      username: body.username,
      firstName: body.firstName,
      lastName: body.lastName,
      link: `https://github.com/${body.username}`,
      visibleContributionCount: 0,
    });

    return utility.generateResponse(201, {
      message: 'Successfully added contributor',
      success: true,

    });
  } catch (err) {
    console.log(err);
    return utility.generateResponse(500, {
      message: err.message,
      success: false,
    });
  }
};

// updates pull requests for the next contributor
// next contributor is chosen:
//   top priority - a contributor that was recently added and not yet updated
//   if all contributors were updated at least once, a round robbin principle is applied
// LIMITATIONS:
// This lambda is meant to be called on a schedule of once per minute due to GitHub Api limitations
//                                                                     (30 search calls per minute)
// If a user has more than 29 forked repositories, only 29 will be handled
// This can be resolved with multiple sequencial calls of this lambda for a single user
module.exports.updateNextContributor = async () => {
  try {
    const nextToUpdate = await databaseService.nextContributor();
    const results = await gitHubApiService.getContributorPullRequests(nextToUpdate.username);
    if (nextToUpdate.updated === 'NO') {
      await databaseService.setContributorUpdated(nextToUpdate.id, 'YES');
    }
    return utility.generateResponse(201, {
      message: 'Successfully updated contributor',
      success: true,
      body: JSON.stringify(results),
    });
  } catch (error) {
    return utility.generateResponse(500, {
      message: error.message,
      success: false,
    });
  }
};

module.exports.getContributions = async (event) => {
  const {
    sortBy, sortDesc, page, itemsPerPage, searchText, usernameSearch,
    repoSearch, titleSearch, dateFrom, dateTo, statusFilter,
  } = event.queryStringParameters || {};
  let response;
  try {
    const [contributions, [contributionsLength]] = await databaseService.getContributionsPaging({
      sortBy: typeof (sortBy) === 'string' ? sortBy : 'author',
      sortDesc: sortDesc === 'true',
      page: page ? parseInt(page, 10) : 1,
      itemsPerPage: itemsPerPage ? parseInt(itemsPerPage, 10) : 13,
      searchText: searchText || '',
      usernameSearch: usernameSearch === 'true',
      repoSearch: repoSearch === 'true',
      titleSearch: titleSearch === 'true',
      dateFrom: dateFrom || '2000-01-01',
      dateTo: dateTo || new Date(),
      statusFilter: statusFilter || 'All',
    });
    response = utility.generateResponse(200, {
      contributions,
      contributionsLength: contributionsLength['COUNT(*)'],
    });
  } catch (error) {
    console.log('error in getContributions handler');
    response = utility.generateResponse(500, {
      message: error.message,
    });
  }
  return response;
};


// Returns visible contributions for single contributor
// Can be merged with getContributions into a single lambda, but getContributors
// part of that new lambda should be invokable only by admin
module.exports.getVisibleUserContributions = async (event) => {
  const {
    username,
  } = event.queryStringParameters || {};
  const result = await databaseService.getVisibleContributorPullRequests(username);
  return utility.generateResponse(200, result);
};

// updates the status of a contribution (Pending, Visible, Hidden)
module.exports.updateContributionStatus = async (event) => {
  const [valid, message, body] = utility.checkBody(event.body, ['status', 'contribution']);
  if (!valid) {
    return utility.generateResponse(400, { message });
  }

  if (['Pending', 'Visible', 'Hidden'].indexOf(body.status) === -1) {
    return utility.generateResponse(400, { message: 'Invalid contributions status' });
  }

  const result = await databaseService.updateContributionStatus(body.status,
    body.contribution.id, body.contribution.author);
  return utility.generateResponse(200, { message: result });
};
