<template>
  <v-card>
    <v-data-table
      :headers="headers"
      :loading="loading"
      :items="contributions"
      :items-per-page="5"
      item-key="link"
      class="elevation-1"
      :page.sync="page"
      hide-default-footer
      @page-count="pageCount = $event"
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
            v-if="item.status != 'Visible'"
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
            v-if="item.status != 'Hidden'"
          >
            <v-icon dark>mdi-eye-off</v-icon>
          </v-btn>
        </v-item-group>
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
import { loadContributorVisibleContributions } from "./../axiosService.js";

export default {
  data() {
    return {
      loading: false,
      headers: [
        { text: "Date Created", value: "dateCreated" },
        { text: "Repository", value: "repo" },
        { text: "Title", value: "title" },
        { text: "Github", value: "link", align: "center" }
      ],
      contributions: [],
      page: 1,
      pageCount: 0
    };
  },
  props: ["username"],
  methods: {
    loadContributions() {
      this.loading = true;
      loadContributorVisibleContributions(this.username)
        .then(response => {
          this.contributions = response.data;
          this.loading = false;
        })
        .catch(e => {
          console.log(e);
          this.loading = false;
        });
    }
  },
  mounted: function() {
    this.loadContributions();
  }
};
</script>