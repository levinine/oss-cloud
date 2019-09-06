<template>
  <v-flex fill-height>
    <v-card height="100%" width="100%" class="flexcard">
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
      <v-card-text class="grow">
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
              <ContributionsTable :username="item.username"></ContributionsTable>
            </td>
          </template>

          <template v-slot:item.link="{ item }">
            <v-btn fab dark color="#24292e" :href="item.link" height="30" width="30" class="mr-5">
              <v-icon dark>mdi-github-circle</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>

      <v-card-actions>
        <v-pagination class="text-center pt-2" v-model="page" :length="pageCount" align="bottom"></v-pagination>
      </v-card-actions>
    </v-card>
  </v-flex>
</template>

<script>
import { loadContributorsAxios } from "./../axiosService.js";
import ContributionsTable from "./ContributionsTable.vue";

export default {
  components: { ContributionsTable },
  data() {
    return {
      page: 1,
      pageCount: 0,
      contributorsLength: 0,
      loading: false,
      searchText: "",
      searchParam: "",
      options: {},
      singleExpand: true,
      expanded: [],
      headers: [
        { text: "Username", align: "left", value: "username" },
        { text: "First name", value: "firstName" },
        { text: "Last name", value: "lastName" },
        {
          text: "Num. of contributions",
          value: "visibleContributionCount",
          align: "center"
        },
        { text: "GitHub", value: "link", align: "right" }
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
        searchParam: this.searchParam,
        showHidden: false
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
.flexcard {
  display: flex;
  flex-direction: column;
}
</style>