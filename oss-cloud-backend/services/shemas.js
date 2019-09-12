
module.exports.schemas = {
  addContributor: {
    $id: 'add',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Contributor',
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
        description: "The contributor's first name.",
      },
      lastName: {
        type: 'string',
        description: "The contributor's last name.",
      },
      username: {
        description: "The contributor's github account username",
        type: 'string',
      },
    },
    required: ['fistName', 'lastName', 'username'],
  },

  contributionStatus: {
    $id: 'cS',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'ContributionStatus',
    type: 'object',
    properties: {
      contribution: {
        type: 'object',
        description: 'Contribution object',
        properties: {
          id: {
            type: 'number',
          },
          author: {
            type: 'string',
          },
        },
        required: ['id', 'author'],
      },
      status: {
        type: 'string',
        description: 'contribution status',
        enum: ['Pending', 'Visible', 'Hidden'],
      },
    },
    required: ['contribution', 'status'],
  },

  userContributions: {
    $id: 'uC',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'UserContributions',
    type: 'object',
    properties: {
      username: {
        description: "The contributor's github account username",
        type: 'string',
      },
    },
    required: ['username'],
  },

  contributors: {
    $id: 'uC',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Contributors',
    type: 'object',
    properties: {
      sortBy: {
        type: 'string',
        enum: ['username', 'firstName', 'lastName', 'visibleContributionCount', 'link'],
      },
      sortDesc: {
        type: 'string',
      },
      page: {
        type: 'string',
        pattern: '[0-9]+',
      },
      itemsPerPage: {
        type: 'string',
        pattern: '[0-9]+',
      },
      searchParam: {
        type: 'string',
      },
      showHidden: {
        type: 'string',
      },
    },
  },

  constributions: {
    $id: 'uC',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Contributors',
    type: 'object',
    properties: {
      sortBy: {
        type: 'string',
        enum: ['repo', 'number', 'link', 'title', 'dateCreated', 'status', 'author'],
      },
      sortDesc: {
        type: 'string',
      },
      page: {
        type: 'string',
        pattern: '[0-9]+',
      },
      itemsPerPage: {
        type: 'string',
        pattern: '[0-9]+',
      },
      searchText: {
        type: 'string',
      },
      usernameSearch: {
        type: 'string',
      },
      repoSearch: {
        type: 'string',
      },
      titleSearch: {
        type: 'string',
      },
      dateFrom: {
        type: 'string',
      },
      dateTo: {
        type: 'string',
      },
      statusFilter: {
        type: 'string',
        enum: ['Pending', 'Visible', 'Hidden', 'All'],
      },
    },
  },
};
