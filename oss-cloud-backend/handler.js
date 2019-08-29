'use strict';

const access_token = process.env.GITHUB_ACCESS_TOKEN;
const Octokit = require('@octokit/rest') // github api library
const octokit = new Octokit({
  auth: access_token,
})

octokit.hook.error('request', async (error, options) => {
  console.log("ERROR", error.status)

  throw error
})

module.exports.hello = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};


// returns all pull requests from parents of all forked repos for a single github user
// POST expected json
// {
//    username: string  
// }
module.exports.getPulls = (event, context, callback) => {
  var body = JSON.parse(event.body);
  getRepos(body.username) // get all repos of a user
  .then(repos => getRepoDetails(repos))
  .then(repos => getParentRepos(repos))
  .then(repos => getUserPulls(body.username, repos))
  .then(pulls => callback(null, pulls))
  .catch((err) => callback(err))

};

// HELPER FUNCTIONS FOR GETPULLS

// returns all repos of a single user
var getRepos = async (username) => {
  return octokit.repos.listForUser({
    username: username,
    type: 'all',
  }).then(({data, headers, status}) => {
    data = data ? (data instanceof Array ? data : [ data ]) : []
    console.log("repos: ", data.length, " status", status)
    return data;
  })
}

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

// returns a given page of pulls from a repo
var getPulls = async (owner, repo, page) => {
  return octokit.pulls.list({
    owner: owner,
    repo: repo,
    per_page: 100,
    page: page,
    state: "all"
  }).then(({data, headers, status}) => {
    data = data ? (data instanceof Array ? data : [ data ]) : []
    console.log("pulls: ", data.length, " status", status)
    return data;
  })
}

// returns all pulls from a repo
var getAllPulls = async (owner, repo) => {
  let page = 1;
  let pulls = [];
  let pullNum = 0;
  do {
    let newPulls = await getPulls(owner, repo, page);
    pullNum = newPulls.length;
    page += 1
    pulls = pulls.concat(newPulls);
  } while (pullNum >= 100)

  return pulls;
}

// returns only forked repos from an array of repos
var filterForked = (repos) => {
  var forkedRepos = []
  for (let repo of repos) if (repo.fork) forkedRepos.push(repo);  // filter out non-forked repos
  return forkedRepos;
}

// makes a call to github api for each repo in array, returning a more detailed representation of the repo
var getRepoDetails = async (repos) => {
  repos = filterForked(repos);
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
    //let repoPulls = await getAllPulls(repo.owner.login, repo.name);
    //console.log(repoPulls.length)
    //repoPulls = repoPulls.filter(pull => pull.user.login == username);
    let repoPulls = await searchUserPulls(username, repo);
    pulls = pulls.concat(repoPulls);
    return repoPulls;
  })

  await Promise.all(pullsPromises);

  console.log(pulls);
  return pulls;
}

var searchUserPulls = async(username, repo) => {
  console.log("searching pull requests: ", username, repo.name)
  return octokit.search.issuesAndPullRequests({
    q: "repo:" + repo.owner.login + "/" + repo.name + "+author:" + username + "+is:pr",
    per_page: 100
  }).then(({data, headers, status}) => {
    return data.items;
  })
}