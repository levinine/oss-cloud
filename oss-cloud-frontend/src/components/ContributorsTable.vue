<template>
  <v-card>
    <v-card-title>
      Contributors
      <div class="flex-grow-1"></div>
      <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="contributors"
      :search="search"
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
  </v-card>
</template>

<script>
import { loadContributorsAxios } from "./../axiosService.js";

export default {
  data() {
    return {
      search: "",
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
  methods: {
    loadContributors() {
      loadContributorsAxios().then(response => {
        this.contributors = response.data;
      });
    }
  },
  mounted: function() {
    this.loadContributors();
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