<template>
  <v-card>
    <v-card-title>
      Contributors
      <div class="flex-grow-1"></div>
      <v-text-field
        v-model="searchText"
        @click:append="updateSeachParam"
        @keydown="$event.key==='Enter' ?  updateSeachParam(): null "
        append-icon="search"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="contributors"
      :page.sync="page"
      hide-default-footer
      @page-count="pageCount = $event"
      :options.sync="options"
      :server-items-length="contributorsLength"
      :loading="loading"
      :single-expand="singleExpand"
      :expanded.sync="expanded"
      item-key="username"
      show-expand
      class="elevation-2"
    >
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length" class="grey lighten-4">
          <v-card class="grey lighten-4">
            <v-card-title>
              Contributions table
              <div class="flex-grow-1"></div>
              <v-text-field
                v-model="contributionsTable.search"
                append-icon="search"
                label="Search"
                single-line
                hide-details
              ></v-text-field>
            </v-card-title>
            <v-data-table
              class="grey lighten-4"
              :headers="contributionsTable.headers"
              :items="item.contributions"
              :search="contributionsTable.search"
            ></v-data-table>
          </v-card>
        </td>
      </template>
      <template v-slot:item.username="{ item }">
        <a :href="item.link">{{ item.username}}</a>
      </template>
    </v-data-table>
    <div class="text-center pt-2">
      <v-pagination v-model="page" :length="pageCount"></v-pagination>
    </div>
  </v-card>
</template>

<script>
import { loadContributorsAxios } from "./../axiosService.js";

export default {
  data() {
    return {
      page: 1,
      pageCount: 0,
      itemsPerPage: 10,
      contributorsLength: 0,
      loading: false,
      searchText: "",
      searchParam: "",
      options: {},
      singleExpand: true,
      expanded: [],
      headers: [
        {
          text: "Username",
          align: "left",
          value: "username"
        },
        { text: "First name", value: "firstName" },
        { text: "Last name", value: "lastName" },
        { text: "Num. of contributions", value: "contributionCount" }
      ],
      contributors: [],
      contributionsTable: {
        search: "",
        headers: [
          { text: "Repository", value: "repo" },
          { text: "Number", value: "number" },
          { text: "Title", value: "title" },
          { text: "Link", value: "link" },
          { text: "Status", value: "status" }
        ]
      }
    };
  },
  watch: {
    options: {
      handler() {
        this.loadContributors();
      },
      deep: true
    },
    searchParam: {
      handler() {
        this.loadContributors();
      }
    }
  },
  methods: {
    updateSeachParam() {
      this.searchParam = this.searchText;
    },
    loadContributors() {
      this.loading = true;
      let { sortBy, sortDesc, page, itemsPerPage } = this.options;
      sortBy = sortBy[0];
      sortDesc = sortDesc[0];
      loadContributorsAxios({
        sortBy,
        sortDesc,
        page,
        itemsPerPage,
        searchParam: this.searchParam
      }).then(response => {
        this.contributors = response.data.contributors;
        this.contributorsLength = response.data.contributorsLength;
        this.loading = false;
      });
    }
  },
  mounted: function() {
    this.options.itemsPerPage = 15;
    this.$root.$on("addedContributorEvent", () => {
      this.loadContributors();
    });
  }
};
</script>

<style scoped>
.contributionsTable {
  margin: 0 25% 0 25%;
}
</style>