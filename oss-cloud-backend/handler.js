"use strict";

var gitHubApiService = require("./gitHubApiService.js");
var databaseService = require("./databaseService.js");
// TODO rename "pulls" to "pull requests"

module.exports.hello = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v1.0! Your function executed successfully!",
        input: event
      },
      null,
      2
    )
  };
};

module.exports.addContributor = async (event, context, callback) => {
  const [err, usernameExists] = await databaseService.checkUsername(
    event.body.username
  );
  if (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err.message,
        success: false
      })
    };
  }

  if (usernameExists) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Username is already registered on this platform",
        success: false
      })
    };
  }

  // check git
  // put in base
};

// returns all pull requests from parents of all forked repos for a single github user
// POST expected json
// {
//    username: string
// }
module.exports.getPullRequests = async (event, context, callback) => {
  let response;
  // check if request is valid
  try {
    var body = JSON.parse(event.body);
    body.username;
  } catch {
    response = {
      statusCode: 500,
      body: JSON.stringify({ message: "Invalid JSON format" })
    };
    return response;
  }

  if (!body.username) {
    console.log('Property "username" missing from request body');
    response = {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Property "username" missing from request body'
      })
    };
    return response;
  }
  // getting pull requests
  try {
    const repos = await gitHubApiService.getForkedRepos(body.username);
    const reposDetailed = await gitHubApiService.getRepoDetails(repos);
    const parentRepos = await gitHubApiService.getParentRepos(reposDetailed);
    const pullRequests = await gitHubApiService.getUserPullRequests(
      body.username,
      parentRepos
    );
    response = {
      statusCode: 200,
      body: JSON.stringify(pullRequests)
    };
  } catch (error) {
    console.log("error in getPullRequests handler: ", error);
    response = {
      statusCode: error.status,
      body: JSON.stringify({
        message: error.message
      })
    };
  } finally {
    return response;
  }
};
