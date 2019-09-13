<template>
  <v-app>
    <v-content>
      <Header :loggedIn="loggedIn"></Header>
      <router-view :loggedIn="loggedIn" />
    </v-content>
  </v-app>
</template>

<script>
import { Auth } from "aws-amplify";
import Header from "./components/Header.vue";
export default {
  name: "App",
  components: { Header },
  data() {
    return { loggedIn: false };
  },
  mounted() {
    this.$root.$on("loginEvent", () => {
      this.login();
    });
    this.$root.$on("logoutEvent", () => {
      this.logout();
    });
    Auth.currentAuthenticatedUser()
      .then(() => {
        this.loggedIn = true;
      })
      .catch(() => {
        this.loggedIn = false;
      });
  },
  methods: {
    login() {
      this.loggedIn = true;
    },
    logout() {
      this.loggedIn = false;
      if (this.$router.currentRoute.name !== "contributorsView")
        this.$router.push("/contributors");
    }
  }
};
</script>


<style scoped lang="scss">
@import url("https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons");
</style>
