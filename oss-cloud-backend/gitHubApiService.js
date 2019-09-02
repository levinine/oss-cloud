const access_token = process.env.GITHUB_ACCESS_TOKEN;
const Octokit = require("@octokit/rest"); // github api library
const octokit = new Octokit({
  auth: access_token
});

// checks if username exists on GitHub
// params: username
// return: Promise bool if
module.exports.checkUsername = async username => {
  return octokit.search
    .users({
      q: `user:${username}`
    })
    .then(() => true)
    .catch(() => false);
};

// returns a single repo
var getRepo = async (owner, repo) => {
  return octokit.repos
    .get({
      owner: owner,
      repo: repo
    })
    .then(({ data, headers, status }) => {
      console.log("repo: ", data.name, " status", status);
      return data;
    });
};

module.exports.getForkedRepos = async username => {
  return octokit.search
    .repos({
      q: "user:" + username + "+fork:only"
    })
    .then(({ data, headers, status }) => {
      return data.items;
    });
};

// makes a call to github api for each repo in array, returning a more detailed representation of the repo
module.exports.getRepoDetails = async repos => {
  const repoPromises = repos.map(repo => {
    return getRepo(repo.owner.login, repo.name);
  });

  return Promise.all(repoPromises);
}

// returns the parent repos from an array of forked repos (details needed)
module.exports.getParentRepos = async repos => {
  const repoPromises = repos.map(repo => {
    return getRepo(repo.parent.owner.login, repo.parent.name);
  });

  return Promise.all(repoPromises);

}

// retrieves pull requests for given user for each repo in given array
module.exports.getUserPullRequests = async (username, repos) => {
  let pullRequests = [];
  const pullRequestPromises = repos.map(async repo => {
    let repoPullRequests = await searchUserPullRequests(username, repo);
    pullRequests = pullRequests.concat(repoPullRequests);
    return repoPullRequests;
  });

  await Promise.all(pullRequestPromises);

  console.log("Retrieved", pullRequests.length, "for user", username);
  return pullRequests;
};

// returns pull requests from a repo where given user is the author
searchUserPullRequests = async (username, repo) => {
  console.log("searching pull requests: ", username, repo.name);
  var pullRequests = [];
  let pullRequestNum = 0;
  do {
    await octokit.search.issuesAndPullRequests({
      q: "repo:" + repo.owner.login + "/" + repo.name + "+author:" + username + "+is:pr",
      per_page: 100,
      page: pullRequestNum
    }).then(({data, headers, status}) => {
      pullRequests = pullRequests.concat(data.items);
      pullRequestNum = data.items.length;
    });
    
  } while (pullRequestNum >= 100);

  return pullRequests;
};
