<template>
  <v-flex fill-height>
    <v-card height="100%" width="100%" class="flexcard">
      <v-card-title>
        <v-row>
          <v-col cols="3">
            <v-text-field
              v-model="searchText"
              @click:append="updateSeachParam"
              @keydown="$event.key==='Enter' ?  updateSeachParam(): null "
              append-icon="search"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>
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
          @click:row="expandRow"
        >
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length" class="grey lighten-4">
              <ContributionsTable :username="item.username" :key="item.username"></ContributionsTable>
            </td>
          </template>

          <template v-slot:item.link="{ item }">
            <v-btn
              fab
              dark
              color="#24292e"
              :href="item.link"
              height="30"
              width="30"
              class="mr-5"
              @mouseenter="isMouseOverButton = true"
              @mouseleave="isMouseOverButton = false"
            >
              <v-icon dark>mdi-github-circle</v-icon>
            </v-btn>
          </template>

          <template v-slot:item.username="{ item }">
            <a v-if="loggedIn" @click="showContributions(item.username)">
              <div><img height=48 width=48 :src="item.imageUrl" /></div>
              <div>{{item.username}}</div>
            </a>
            <div v-if="!loggedIn">
              <div><img height=48 width=48 :src="item.imageUrl" /></div>
              <div>{{item.username}}</div>
            </div>
          </template>
        </v-data-table>
        <div class="my-3 mx-8 float-right">
          <v-label>{{Math.min(this.options.itemsPerPage*(page-1) + 1,contributorsLength||0)}}-{{Math.min(this.options.itemsPerPage*page, contributorsLength)}} of {{contributorsLength}}</v-label>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-pagination
          class="text-center pt-2"
          v-model="page"
          :length="pageCount"
          total-visible="7"
          align="bottom"
        ></v-pagination>
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
      isMouseOverButton: false,
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
  props: ["loggedIn"],
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
    showContributions(username) {
      this.$router.replace({
        name: "contributionsView",
        params: { username }
      });
    },
    expandRow(item) {
      if (this.isMouseOverButton) {
        return;
      }
      if (this.expanded.length === 0 || this.expanded[0] !== item)
        this.expanded = [item];
      else this.expanded = [];
    },
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
      })
        .then(response => {
          this.contributors = response.data.contributors;
          this.contributorsLength = response.data.contributorsLength;
          this.loading = false;
        })
        .catch(e => {
          // eslint-disable-next-line
          console.log(e);
          this.loading = false;
        });
    }
  },
  mounted: function() {
    this.options.itemsPerPage = 13;
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