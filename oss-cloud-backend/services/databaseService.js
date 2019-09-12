const mysql = require('serverless-mysql')({
  config: {
    host: process.env.MYSQL_ENDPOINT,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  },
});

module.exports.getContributor = (username) => mysql.query('SELECT * FROM contributors WHERE username=?', [username]);

module.exports.insertPullRequests = (pullRequests) => {
  const prs = pullRequests.map((pr) => [
    pr.repo,
    pr.owner,
    pr.number,
    pr.link,
    pr.title,
    pr.dateCreated,
    pr.status,
    pr.author,
  ]);
  return mysql
    .query(
      'INSERT INTO contributions (repo, owner, number, link, title, dateCreated, status, author) VALUES ?',
      [prs],
    );
};

module.exports.getContributorsPaging = (params) => mysql
  .transaction()
  .query(
    `SELECT * FROM contributors WHERE ${params.showHidden ? '' : 'visibleContributionCount>0 AND '}
    (INSTR(username, ?) > 0 OR INSTR(firstName, ?) > 0 
    OR INSTR(lastName, ?) > 0) ORDER BY ??
    ${params.sortDesc ? 'DESC' : 'ASC'}
     LIMIT ?,?`,
    [params.searchParam, params.searchParam, params.searchParam,
      params.sortBy === undefined ? 'username' : params.sortBy,
      (params.page - 1) * params.itemsPerPage, params.itemsPerPage],
  )
  .query(`SELECT COUNT(*) FROM contributors WHERE ${params.showHidden ? '' : 'visibleContributionCount>0 AND '}
  (INSTR(username, ?) > 0 OR INSTR(firstName, ?) > 0  OR INSTR(lastName, ?) > 0) `,
  [params.searchParam, params.searchParam, params.searchParam])
  .rollback(() => {})
  .commit();


module.exports.getAllContributors = () => mysql.query('SELECT * FROM contributors');

module.exports.checkUsername = async (username) => {
  const res = await mysql.query(
    'SELECT username FROM contributors WHERE username = ?',
    [username],
  );
  return res.length !== 0;
};

// saves contributor object in database
// params: contributor
module.exports.addContributor = (contributor) => mysql
  .query('INSERT INTO contributors (username, firstName, lastName, link, visibleContributionCount) VALUES(?)',
    [[
      contributor.username,
      contributor.firstName,
      contributor.lastName,
      contributor.link,
      contributor.visibleContributionCount,
    ]]);


module.exports.getContributionsPaging = (params) => {
  let searchTextPart = '';
  let queryParams = [];
  if (params.usernameSearch || params.repoSearch || params.titleSearch) {
    if (params.usernameSearch) {
      searchTextPart += 'INSTR(author, ?) > 0 OR ';
      queryParams = queryParams.concat(params.searchText);
    }
    if (params.repoSearch) {
      searchTextPart += '(INSTR(owner, ?) > 0 OR INSTR(repo, ?) > 0) OR ';
      queryParams = queryParams.concat([params.searchText, params.searchText]);
    }
    if (params.titleSearch) {
      searchTextPart += 'INSTR(title, ?) > 0 OR ';
      queryParams = queryParams.concat(params.searchText);
    }
    searchTextPart = `(${searchTextPart.slice(0, -4)}) AND `;
  }
  let statusPart = '';
  if (params.statusFilter !== 'All') {
    statusPart = 'status = ? AND ';
    queryParams = queryParams.concat([params.statusFilter]);
  }
  queryParams = queryParams.concat([params.dateFrom, params.dateTo,
    params.sortBy === undefined ? 'author' : params.sortBy,
    (params.page - 1) * params.itemsPerPage, params.itemsPerPage]);
  return mysql
    .transaction()
    .query(
      `SELECT * FROM contributions WHERE
    ${searchTextPart}
    ${statusPart}
    dateCreated BETWEEN ? and ? 
    ORDER BY
    ${params.sortBy === 'repo' ? `owner ${params.sortDesc ? 'DESC' : 'ASC'}, ` : ''}
    ?? ${params.sortDesc ? 'DESC' : 'ASC'}
    LIMIT ?,?`,
      queryParams,
    )
    .query(`SELECT COUNT(*) FROM contributions WHERE
    ${searchTextPart}
    ${statusPart}
    dateCreated BETWEEN ? and ?  `, queryParams.slice(0, queryParams.length - 3))
    .rollback(() => {})
    .commit();
};

module.exports.getContributorPullRequests = (username) => mysql
  .query('SELECT * FROM contributions WHERE author=?', [username]);

module.exports.getVisibleContributorPullRequests = (username) => mysql
  .query('SELECT * FROM contributions WHERE author=? AND status=?', [username, 'Visible']);

// update status of contribution and update contributor's visible contribution count
module.exports.updateContributionStatus = async (status, id, author) => {
  const [oldContribution] = await mysql.query('SELECT * FROM contributions WHERE id=?', [id]);
  let query;
  if (status === 'Visible' && oldContribution.status !== 'Visible') {
    query = 'UPDATE contributors SET visibleContributionCount = visibleContributionCount + 1 WHERE username = ?';
  } else if (status !== 'Visible' && oldContribution.status === 'Visible') {
    query = 'UPDATE contributors SET visibleContributionCount = visibleContributionCount - 1 WHERE username = ?';
  } else {
    // no need to update visible contribuion count
    return mysql.query('UPDATE contributions SET status=? WHERE id=?', [status, id]);
  }
  // need to update both contribuion status and visible contribution count
  return mysql.transaction()
    .query('UPDATE contributions SET status=? WHERE id=?', [status, id])
    .query(query, [author])
    .rollback(() => {})
    .commit();
};

// returns the next contributor for the purpose of updating their pull requests
// priority goes to contributors who have not yet been handled
// if no such contributors exist, round robbin priniple is applied
module.exports.nextContributor = async () => {
  // recetly added
  const [nextNew] = await mysql.query('SELECT * FROM contributors WHERE updated=? LIMIT 1', ['NO']);
  if (nextNew) {
    return nextNew;
  }
  // round robbin
  const [lastUpdatedRow] = await mysql.query('SELECT lastUpdated FROM lastUpdated WHERE id=1');
  let [nextToUpdate] = await mysql.query('SELECT * FROM contributors WHERE id>? LIMIT 1', [lastUpdatedRow.lastUpdated]);
  if (!nextToUpdate) {
    // end of table is reached, start from beginning
    [nextToUpdate] = await mysql.query('SELECT * FROM contributors WHERE id>0 LIMIT 1');
  }
  await mysql.query('UPDATE lastUpdated SET lastUpdated=? WHERE id=1', [nextToUpdate.id]);
  return nextToUpdate;
};

module.exports.setContributorUpdated = async (id, status) => mysql
  .query('UPDATE contributors SET updated=? WHERE id=?', [status, id]);
