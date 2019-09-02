"use strict";

var gitHubApiService = require('./gitHubApiService.js')

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


// returns all pull requests from parents of all forked repos for a single github user
// POST expected json
// {
//    username: string  
// }
module.exports.updatePullRequests = async (event, context, callback) => {
  let response;
  try {
    const results = await gitHubApiService.updatePullRequests();
    response = {
      statusCode: 200,
      body: results.toString() + " contributors updated"
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

