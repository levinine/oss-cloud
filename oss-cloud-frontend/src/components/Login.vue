<template>
  <v-dialog v-model="dialog" max-width="600px">
    <template v-slot:activator="{ on }">
      <v-btn color="#1533a1" class="mt-10 mr-2" v-on="on">Log in</v-btn>
    </template>
    <v-card>
      <v-form ref="loginForm" v-model="valid" @submit.prevent="login">
        <v-card-title>
          <span class="headline">Log in</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  label="Username"
                  required
                  v-model="username"
                  :rules="notEmptyRule"
                  @input="showAlert=false"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Password"
                  required
                  v-model="password"
                  type="password"
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
          <v-btn color="blue darken-1" type="submit" text :disabled="!valid">Login</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { Auth } from "aws-amplify";

export default {
  data() {
    return {
      dialog: false,
      valid: true,
      showAlert: false,
      alertMessage: "",
      alertType: "error",
      username: "",
      password: "",
      notEmptyRule: [v => !!v || "Must not be empty"]
    };
  },
  methods: {
    async login() {
      try {
        let user = await Auth.signIn(this.username, this.password);
        if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
          user = await Auth.completeNewPassword(user, this.password);
        }
        this.dialog = false;
        this.$root.$emit("loginEvent");
      } catch (err) {
        if (err.code === "UserNotFoundException")
          this.alertMessage = "Wrong username";
        else if (err.code === "NotAuthorizedException")
          this.alertMessage = "Wrong password";
        else {
          this.alertMessage = "Error while logging in";
        }
        this.showAlert = true;
      }
    }
  },
  watch: {
    dialog() {
      if (this.dialog == false) this.$refs.loginForm.reset();
    }
  }
};
</script>
