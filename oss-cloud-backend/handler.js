"use strict";

var getPullsHandler = require('./getPullsHandler.js')


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
      body: JSON.stringify({message: 'Invalid JSON format'})
    };
    return response;
  }

  if (!body.username) {
    console.log ('Property "username" missing from request body')
    response = {
      statusCode: 500,
      body: JSON.stringify({message: 'Property "username" missing from request body'})
    };
    return response;
  }
  // getting pull requests
  try {
    const repos = await getPullsHandler.getForkedRepos(body.username);
    const reposDetailed = await getPullsHandler.getRepoDetails(repos);
    const parentRepos = await getPullsHandler.getParentRepos(reposDetailed)
    const pullRequests = await getPullsHandler.getUserPulls(body.username, parentRepos);
    response = {
      statusCode: 200,
      body: JSON.stringify(pullRequests)
    }

  } catch (error) {
    console.log("error in getPullRequests handler: ", error);
    response = {
      statusCode: error.status,
      body: JSON.stringify({
        message: error.message
      })
    }
  } finally {
    return response;
  }
};

