<template>
  <v-card>
    <v-card-title>
      Contributions
      <div class="flex-grow-1"></div>
      <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="contributions"
      :items-per-page="10"
      item-key="link"
      class="elevation-1"
    >
      <template v-slot:item.link="{ item }">
        <a :href="item.link">{{ item.link}}</a>
      </template>

      <template v-slot:item.actions="{ item }">
          <v-item-group row>
          <v-btn fab dark color="green" height="30" width="30" class="mx-1" @click="updateStatus(item, 'Visible')">
            <v-icon dark>mdi-eye</v-icon>
          </v-btn>
          <v-btn fab dark color="red" height="30" width="30" class="mx-1" @click="updateStatus(item, 'Hidden')">
            <v-icon dark>mdi-eye-off</v-icon>
          </v-btn>
        </v-item-group>
      </template>

      <template v-slot:item.status="{ item }" class="statusTd">
        <div v-if="item.status=='Visible'" class="green--text">{{ item.status }}</div>
        <div v-else-if="item.status=='Hidden'" class="red--text">{{ item.status }}</div>
        <div v-else>{{ item.status }}</div>
      </template>

      <template v-slot:item.dateCreated="{ item }">
        {{ new Date(item.dateCreated).toJSON().slice(0,10) }}
      </template>

      <template v-slot:item.link="{ item }">
        <v-btn fab dark color="#24292e" :href="item.link" height="30" width="30">
          <v-icon dark>mdi-github-circle</v-icon>
        </v-btn>
      </template>

      <template v-slot:item.repo="{ item }">
        {{ `${item.owner}/${item.repo}` }}
      </template>
    </v-data-table>

  </v-card>
</template>

<script>
import { loadContributionsAxios } from "./../axiosService.js";
import { updateContributionStatus } from "./../axiosService.js";

export default {
  data() {
    return {
      singleExpand: true,
      expanded: [],
      headers: [
        { text: "Username", align: "left", value: "author" },
        { text: "Date Created", value: "dateCreated" },
        { text: "Repository", value: "repo" },
        { text: "Title", value: "title" },
        { text: "Status", value: "status", align: "left"},
        { text: "Actions", value: "actions", align: "right"},
        { text: "Github", value: "link", align: "center"},
      ],
      contributions: []
    };
  },
  methods: {
    loadContributions() {
      loadContributionsAxios().then(response => {
        this.contributions = response.data;
      });
    },
    updateStatus(contribution, status) {
      updateContributionStatus(contribution.owner, contribution.repo, contribution.number, status)
      .then(response => {
        console.log(response);
        this.loadContributions();
      })
    }
  },
  mounted: function() {
    this.loadContributions();
  }
};
</script>

<style scoped>
.statusTd {
  min-width: 7em;
}
</style>