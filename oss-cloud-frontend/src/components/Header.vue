<template>
  <v-app-bar color="#1533a1" app :extended="true" dark>
    <v-img class="mt-11" src="./../assets/logo.jpg" max-height="200" max-width="180" contain dark></v-img>
    <v-toolbar-title class="mt-11 ml-5 headline">Open-Source Software Cloud</v-toolbar-title>
    <v-spacer></v-spacer>
    <div>
      <v-btn color="#1533a1" class="mt-10 mr-2" to="/contributors" v-if="loggedIn">Contributors</v-btn>
      <v-btn color="#1533a1" class="mt-10 mr-2" to="/contributions" v-if="loggedIn">Contributions</v-btn>
    </div>
    <div class="mx-3">
      <AddContributor></AddContributor>
      <Logout v-if="loggedIn"></Logout>
      <Login v-if="!loggedIn"></Login>
    </div>
  </v-app-bar>
</template>

<script>
import AddContributor from "./AddContributor.vue";
import Login from "./Login.vue";
import Logout from "./Logout.vue";

export default {
  components: { AddContributor, Login, Logout },
  props: ["loggedIn"]
};
</script>