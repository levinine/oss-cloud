<template>
  <v-data-table
    :headers="headers"
    :items="contributions"
    :items-per-page="10"
    item-key="link"
    class="elevation-1"
  ></v-data-table>
</template>

<script>
import axios from "axios";

const contributionsURL = "http://localhost:3000/contributions";

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
      axios({
        method: "get",
        url: contributionsURL
      }).then(response => {
        this.contributions = response.data;
      });
    }
  },
  mounted: function() {
    this.loadContributions();
  }
};
</script>