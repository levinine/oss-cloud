
const access_token = process.env.GITHUB_ACCESS_TOKEN;
const Octokit = require('@octokit/rest') // github api library
const octokit = new Octokit({
  auth: access_token,
})
octokit.hook.error('request', async (error, options) => {
  throw error
})

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

module.exports.getForkedRepos = async(username) => {
  return octokit.search.repos({
    q: "user:" + username + "+fork:only"
  }).then(({data, headers, status}) => {
    return data.items;
  })
}


// makes a call to github api for each repo in array, returning a more detailed representation of the repo
module.exports.getRepoDetails = async (repos) => {
  const repoPromises = repos.map(async (repo) => {
    return getRepo(repo.owner.login, repo.name)
  })

  return await Promise.all(repoPromises);
}

// returns the parent repos from an array of forked repos (details needed)
module.exports.getParentRepos = async (repos) => {
  const repoPromises = repos.map(async (repo) => {
    return getRepo(repo.parent.owner.login, repo.parent.name);
  })

  return await Promise.all(repoPromises);

}

// retrieves pulls for given user for each repo in given array
module.exports.getUserPulls = async (username, repos) => {
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
searchUserPulls = async(username, repo) => {
  console.log("searching pull requests: ", username, repo.name)
  return octokit.search.issuesAndPullRequests({
    q: "repo:" + repo.owner.login + "/" + repo.name + "+author:" + username + "+is:pr",
    per_page: 100
  }).then(({data, headers, status}) => {
    return data.items;
  })
}