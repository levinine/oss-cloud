<template>
  <v-dialog v-model="dialog" max-width="600px">
    <template v-slot:activator="{ on }">
      <v-btn color="#1533a1" class="mt-10 mr-10" v-on="on">Add contributor</v-btn>
    </template>
    <v-card>
      <v-form ref="addContributorForm" v-model="valid" @submit="addContributor">
        <v-card-title>
          <span class="headline">Add contributor</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  label="Username"
                  required
                  v-model="contributor.username"
                  :rules="notEmptyRule"
                  @input="showAlert=false"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="First Name"
                  required
                  v-model="contributor.firstName"
                  :rules="notEmptyRule"
                  @input="showAlert=false"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Last Name"
                  required
                  v-model="contributor.lastName"
                  :rules="notEmptyRule"
                  @input="showAlert=false"
                ></v-text-field>
              </v-col>
              <v-alert
                transition="scale-transition"
                v-model="showAlert"
                prominent
                dense
                :type="alertType"
                :alertMessage="alertMessage"
              >{{alertMessage}}</v-alert>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
          <v-btn
            color="blue darken-1"
            type="submit"
            text
            :disabled="!valid"
            @click="addContributor"
          >Add</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { addContributorAxios } from "./../axiosService.js";

export default {
  data() {
    return {
      valid: true,
      showAlert: false,
      alertMessage: "",
      dialog: false,
      alertType: "success",
      contributor: {
        username: "",
        firstName: "",
        lastName: ""
      },
      notEmptyRule: [v => !!v || "Must not be empty"]
    };
  },
  methods: {
    addContributor() {
      addContributorAxios(this.contributor)
        .then(response => {
          this.alertMessage = response.data.message;
          this.alertType = "success";
          this.showAlert = true;
          this.$root.$emit("addedContributorEvent");
        })
        .catch(error => {
          this.alertMessage = error.response.data.message;
          this.alertType = "error";
          this.showAlert = true;
        });
    }
  },
  watch: {
    dialog() {
      if (this.dialog == false) this.$refs.addContributorForm.reset();
    }
  }
};
</script>
