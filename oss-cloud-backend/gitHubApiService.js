const accessToken = process.env.GITHUB_ACCESS_TOKEN;
const Octokit = require('@octokit/rest');
// github api library
const octokit = new Octokit({
  auth: accessToken,
});

const databaseService = require('./databaseService.js');

// checks if username exists on GitHub
// params: username
// return: Promise bool if
module.exports.checkUsername = async (username) => {
  octokit.search
    .users({
      q: `user:${username}`,
    })
    .then(() => true)
    .catch(() => false);
};
// returns a single repo
const getRepo = async (owner, repo) => octokit.repos
  .get({
    owner,
    repo,
  })
  .then(({ data }) => data);

const getForkedRepos = async (username) => octokit.search
  .repos({ q: `user:${username}+fork:only` })
  .then((response) => response.data.items);


// makes a call to github api for each repo in array
// returns a more detailed representation of the repo
const getRepoDetails = async (repos) => {
  const repoPromises = repos.map((repo) => getRepo(repo.owner.login, repo.name));

  return Promise.all(repoPromises);
};

// returns the parent repos from an array of forked repos (details needed)
const getParentRepos = async (repos) => {
  const repoPromises = repos.map((repo) => getRepo(repo.parent.owner.login, repo.parent.name));

  return Promise.all(repoPromises);
};

// returns pull requests from a repo where given user is the author
const searchUserPullRequests = async (username, repo) => {
  console.log('searching pull requests: ', username, repo.name);
  let pullRequests = [];
  let pullRequestNum = 0;
  do {
    await octokit.search
      .issuesAndPullRequests({
        q: `repo:${repo.owner.login}/${repo.name}+author:${username}+is:pr`,
        per_page: 100,
        page: pullRequestNum,
      })
      .then((response) => {
        pullRequests = pullRequests.concat(
          response.data.items.map((pr) => {
            const newPr = pr;
            newPr.repo = repo.name; // add repo name as attribute of pull request
            return newPr;
          }),
        );
        pullRequestNum = response.data.items.length;
      });
  } while (pullRequestNum >= 100);

  return pullRequests;
};

// retrieves pull requests for given user for each repo in given array
const getUserPullRequests = async (username, repos) => {
  let pullRequests = [];
  const pullRequestPromises = repos.map(async (repo) => {
    const repoPullRequests = await searchUserPullRequests(username, repo);
    pullRequests = pullRequests.concat(repoPullRequests);
    return repoPullRequests;
  });

  await Promise.all(pullRequestPromises);

  console.log('Retrieved', pullRequests.length, 'for user', username);
  return pullRequests;
};

// filter unnecessay attributes from pull requests and add status
const filterPullRequestAttributes = (pullRequests) => pullRequests.map((pr) => ({
  owner: pr.user.login,
  repo: pr.repo,
  number: pr.number,
  link: pr.html_url,
  title: pr.title,
  status: 'Pending',
}));

// compares two lists of pull requests by username
// returns the elements of the first list that do not exits in the second list
const unitePullRequests = (newPullRequests, oldPullRequests) => {
  if (!oldPullRequests || oldPullRequests.length === 0) return newPullRequests;

  const unitedPullRequests = newPullRequests.concat(
    oldPullRequests.filter(
      (oldPr) => !newPullRequests.find(
        (newPr) => oldPr.owner === newPr.owner
            && oldPr.repo === newPr.repo
            && oldPr.number === newPr.number,
      ),
    ),
  );
  return unitedPullRequests;
};

// updates pull requests for a given user
// params: username (string) => username to get from db
// params: pullRequests (array) => pull requests from github of the given user
const updateContributorPullRequests = async (username, pullRequests) => {
  const contributor = await databaseService.getContributor(username);

  const filteredPullRequests = filterPullRequestAttributes(pullRequests);
  console.log('pull requests CCCCCCCCCCCCC', filteredPullRequests);

  const unitedPullRequests = unitePullRequests(
    filteredPullRequests,
    contributor.Item.contributions,
  );

  return databaseService.updateContributorPullRequests(
    username,
    unitedPullRequests,
  );
};

// fetches pull requests from github for a given contributor
// and updates the database with new pull requests
const getContributorPullRequests = async (username) => {
  const repos = await getForkedRepos(username);
  const reposDetailed = await getRepoDetails(repos);
  const parentRepos = await getParentRepos(reposDetailed);
  const pullRequests = await getUserPullRequests(username, parentRepos);
  console.log('pull requests BBBBBBBBBBBB', pullRequests);
  return updateContributorPullRequests(username, pullRequests);
};

// updates pull requests for all contributors in the database
module.exports.updatePullRequests = async () => {
  const contributors = await databaseService.getAllContributors();
  if (contributors.length === 0) {
    return 0;
  }
  const contributorPromises = contributors.map(async (contributor) => {
    const updates = await getContributorPullRequests(contributor.username);
    return updates;
  });

  const results = await Promise.all(contributorPromises);
  return results.map((r) => (r ? 1 : 0)).reduce((a, b) => a + b); // count updated users
};
