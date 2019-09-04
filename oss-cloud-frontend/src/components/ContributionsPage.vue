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
    </v-data-table>

  </v-card>
</template>

<script>
import { loadContributionsAxios } from "./../axiosService.js";

export default {
  data() {
    return {
      singleExpand: true,
      expanded: [],
      headers: [
        {
          text: "Username",
          align: "left",
          value: "owner"
        },
        { text: "Repository", value: "repo" },
        { text: "Number", value: "number" },
        { text: "Title", value: "title" },
        { text: "Link", value: "link" },
        { text: "Status", value: "status"}
      ],
      contributions: []
    };
  },
  methods: {
    loadContributions() {
      loadContributionsAxios().then(response => {
        this.contributions = response.data;
      });
    }
  },
  mounted: function() {
    this.loadContributions();
  }
};
</script>