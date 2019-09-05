<template>
  <v-card>
    <v-card-title>
      Contributions
      <div class="flex-grow-1"></div>
      <v-text-field append-icon="search" label="Search" single-line hide-details></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="contributions"
      :page.sync="page"
      hide-default-footer
      @page-count="pageCount = $event"
      :options.sync="options"
      :server-items-length="contributionsLength"
      :loading="loading"
      item-key="link"
      class="elevation-1"
    >
      <template v-slot:item.link="{ item }">
        <a :href="item.link">{{ item.link}}</a>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-item-group row>
          <v-btn
            fab
            dark
            color="green"
            height="30"
            width="30"
            class="mx-1"
            @click="updateStatus(item, 'Visible')"
          >
            <v-icon dark>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            fab
            dark
            color="red"
            height="30"
            width="30"
            class="mx-1"
            @click="updateStatus(item, 'Hidden')"
          >
            <v-icon dark>mdi-eye-off</v-icon>
          </v-btn>
        </v-item-group>
      </template>

      <template v-slot:item.status="{ item }" class="statusTd">
        <div v-if="item.status=='Visible'" class="green--text">{{ item.status }}</div>
        <div v-else-if="item.status=='Hidden'" class="red--text">{{ item.status }}</div>
        <div v-else>{{ item.status }}</div>
      </template>

      <template
        v-slot:item.dateCreated="{ item }"
      >{{ new Date(item.dateCreated).toJSON().slice(0,10) }}</template>

      <template v-slot:item.link="{ item }">
        <v-btn fab dark color="#24292e" :href="item.link" height="30" width="30">
          <v-icon dark>mdi-github-circle</v-icon>
        </v-btn>
      </template>

      <template v-slot:item.repo="{ item }">{{ `${item.owner}/${item.repo}` }}</template>
    </v-data-table>
    <div class="text-center pt-2">
      <v-pagination v-model="page" :length="pageCount"></v-pagination>
    </div>
  </v-card>
</template>

<script>
import { loadContributionsAxios } from "./../axiosService.js";
import { updateContributionStatus } from "./../axiosService.js";

export default {
  data() {
    return {
      page: 1,
      pageCount: 0,
      itemsPerPage: 10,
      contributionsLength: 0,
      loading: false,
      options: {},
      headers: [
        { text: "Username", align: "left", value: "author" },
        { text: "Date Created", value: "dateCreated" },
        { text: "Repository", value: "repo" },
        { text: "Title", value: "title" },
        { text: "Status", value: "status", align: "left" },
        { text: "Actions", value: "actions", align: "right", sortable: false },
        { text: "Github", value: "link", align: "center", sortable: false }
      ],
      contributions: []
    };
  },
  watch: {
    options: {
      handler() {
        this.loadContributions();
      },
      deep: true
    }
  },
  methods: {
    loadContributions() {
      this.loading = true;
      let { sortBy, sortDesc, page, itemsPerPage } = this.options;
      sortBy = sortBy[0];
      sortDesc = sortDesc[0];
      loadContributionsAxios({
        sortBy,
        sortDesc,
        page,
        itemsPerPage
      }).then(response => {
        this.contributions = response.data.contributions;
        this.contributionsLength = response.data.contributionsLength;
        this.loading = false;
      });
    },
    updateStatus(contribution, status) {
      updateContributionStatus(status, contribution.id).then(response => {
        console.log(response);
        this.loadContributions();
      });
    }
  },
  mounted: function() {
    this.options.itemsPerPage = 15;
  }
};
</script>

<style scoped>
.statusTd {
  min-width: 7em;
}
</style>