"use strict";

const access_token = process.env.GITHUB_ACCESS_TOKEN;
const Octokit = require('@octokit/rest') // github api library
const octokit = new Octokit({
  auth: access_token,
})

octokit.hook.error('request', async (error, options) => {
  throw error
})

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
  getForkedRepos(body.username) // get all repos of a user
    .then(repos => getRepoDetails(repos))
    .then(repos => getParentRepos(repos))
    .then(repos => getUserPulls(body.username, repos))
    .then(pulls => callback(null, pulls))
    .catch((err) => callback(err, {status: 500, body: err.message}))
};


// returns a single repo
var getRepo = async (owner, repo) => {
  return octokit.repos.get({
    owner: owner,
    repo: repo,
  }).then(({data, headers, status}) => {
    console.log("repo: ", data.name, " status", status)
    return data;
  })
}

var getForkedRepos = async(username) => {
  return octokit.search.repos({
    q: "user:" + username + "+fork:only"
  }).then(({data, headers, status}) => {
    return data.items;
  })
}


// makes a call to github api for each repo in array, returning a more detailed representation of the repo
var getRepoDetails = async (repos) => {
  const repoPromises = repos.map(async (repo) => {
    return getRepo(repo.owner.login, repo.name)
  })

  return await Promise.all(repoPromises);
}

// returns the parent repos from an array of forked repos (details needed)
var getParentRepos = async (repos) => {
  const repoPromises = repos.map(async (repo) => {
    return getRepo(repo.parent.owner.login, repo.parent.name);
  })

  return await Promise.all(repoPromises);

}

// retrieves pulls for given user for each repo in given array
var getUserPulls = async (username, repos) => {
  let pulls = [];
  const pullsPromises = repos.map(async (repo) => {
    let repoPulls = await searchUserPulls(username, repo);
    pulls = pulls.concat(repoPulls);
    return repoPulls;
  })

  await Promise.all(pullsPromises);

  return pulls;
}

// returns pulls from a repo where given user is the author
var searchUserPulls = async(username, repo) => {
  console.log("searching pull requests: ", username, repo.name)
  return octokit.search.issuesAndPullRequests({
    q: "repo:" + repo.owner.login + "/" + repo.name + "+author:" + username + "+is:pr",
    per_page: 100
  }).then(({data, headers, status}) => {
    return data.items;
  })
}