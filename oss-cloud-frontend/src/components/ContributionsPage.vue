<template>
  <v-flex fill-height>
    <v-card height="100%" width="100%" class="flexcard">
      <v-card-title>
        <v-row>
          <v-col cols="2">
            <v-text-field
              @keydown="$event.key==='Enter' ?  searchContributions(): null "
              class="mx-4 flex-grow-1"
              v-model="searchText"
              append-icon="search"
              label="Search"
              single-line
            ></v-text-field>
          </v-col>
          <v-radio-group row>
            <template v-slot:label>Apply search to:</template>
            <v-checkbox v-model="usernameSearch" class="mx-1" label="Username"></v-checkbox>
            <v-checkbox v-model="repoSearch" class="mx-1" label="Repository"></v-checkbox>
            <v-checkbox v-model="titleSearch" class="mx-1" label="Title"></v-checkbox>
          </v-radio-group>
          <v-spacer></v-spacer>
          <v-col cols="2">
            <v-menu
              v-model="menu1"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              full-width
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  class="mx-4"
                  v-model="dateFromFormatted"
                  label="Created after"
                  prepend-icon="event"
                  readonly
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                @change="searchContributions"
                v-model="dateFrom"
                @input="menu1 = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="2">
            <v-menu
              v-model="menu2"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              full-width
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  class="mx-4"
                  v-model="dateToFormatted"
                  label="Created before"
                  prepend-icon="event"
                  readonly
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker @change="searchContributions" v-model="dateTo" @input="menu2 = false"></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="1">
            <v-select
              @change="searchContributions"
              class="mx-4"
              :items="['All', 'Pending', 'Visible', 'Hidden']"
              label="Status"
              v-model="statusFilter"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text class="grow">
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
        <div class="my-3 mx-8 float-right">
          <v-label>{{Math.min(this.options.itemsPerPage*(page-1) + 1,contributionsLength||0)}}-{{Math.min(this.options.itemsPerPage*page, contributionsLength)}} of {{contributionsLength}}</v-label>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-pagination
          v-model="page"
          :length="pageCount"
          total-visible="7"
          class="text-center pt-2 float-left"
          align="bottom"
        ></v-pagination>
      </v-card-actions>
    </v-card>
  </v-flex>
</template>
      
<script>
import { loadContributionsAxios } from "./../axiosService.js";
import { updateContributionStatus } from "./../axiosService.js";
const moment = require("moment");
const dateFormat = "DD/MM/YYYY";

export default {
  data() {
    return {
      searchText: "",
      statusFilter: "All",
      usernameSearch: true,
      titleSearch: false,
      repoSearch: false,
      menu1: false,
      menu2: false,
      dateFrom: moment("2000-01-01 01:00")
        .toISOString()
        .substr(0, 10),
      dateTo: moment()
        .toISOString()
        .substr(0, 10),
      page: 1,
      pageCount: 0,
      contributionsLength: 0,
      loading: false,
      options: {},
      headers: [
        { text: "Username", align: "left", value: "author" },
        { text: "Date Created", value: "dateCreated" },
        { text: "Repository", value: "repo" },
        { text: "Title", value: "title" },
        { text: "Status", value: "status", align: "left" },
        { text: "Actions", value: "actions", align: "center", sortable: false },
        { text: "Github", value: "link", align: "center", sortable: false }
      ],
      contributions: []
    };
  },
  computed: {
    dateFromFormatted() {
      return moment(this.dateFrom).format(dateFormat);
    },
    dateToFormatted() {
      return moment(this.dateTo).format(dateFormat);
    }
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
    searchContributions() {
      this.page = 1; // this line is needed
      this.loadContributions();
      this.page = 1; // this line is also needed, without it table stays empty
    },
    loadContributions() {
      this.loading = true;
      let { sortBy, sortDesc, page, itemsPerPage } = this.options;
      sortBy = sortBy[0];
      sortDesc = sortDesc[0];
      loadContributionsAxios({
        sortBy,
        sortDesc,
        page,
        itemsPerPage,
        searchText: this.searchText,
        usernameSearch: this.usernameSearch,
        repoSearch: this.repoSearch,
        titleSearch: this.titleSearch,
        dateFrom: this.dateFrom,
        dateTo: this.dateTo,
        statusFilter: this.statusFilter
      })
        .then(response => {
          this.contributions = response.data.contributions;
          this.contributionsLength = response.data.contributionsLength;
          this.loading = false;
        })
        .catch(e => {
          console.log(e);
          this.loading = false;
        });
    },
    updateStatus(contribution, status) {
      updateContributionStatus(status, contribution).then(response => {
        this.loadContributions();
      });
    }
  },
  mounted: function() {
    this.options.itemsPerPage = 13;
    let searchedUsername = this.$route.params.username;
    if (searchedUsername !== undefined) {
      this.searchText = searchedUsername;
      this.loadContributions();
    }
  }
};
</script>

<style scoped>
.statusTd {
  min-width: 7em;
}

.flexcard {
  display: flex;
  flex-direction: column;
}
</style>