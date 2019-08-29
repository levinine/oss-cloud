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
module.exports.getPulls = (event, context, callback) => {
  var body = JSON.parse(event.body);
  getPullsHandler.getForkedRepos(body.username) // get all repos of a user
    .then(repos => getPullsHandler.getRepoDetails(repos))
    .then(repos => getPullsHandler.getParentRepos(repos))
    .then(repos => getPullsHandler.getUserPulls(body.username, repos))
    .then(pulls => callback(null, pulls))
    .catch(err => {
      console.log("error in getPulls handler: ", err);
      let response = {
        statusCode: err.status,
        body: JSON.stringify({
          message: err.message
        })
      }
      callback(null, response);
    })
};

