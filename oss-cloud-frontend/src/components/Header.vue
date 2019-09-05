<template>
  <v-app-bar color="#1533a1" app extended="true" dark>
    <v-img class="mt-11" src="./../assets/logo.jpg" max-height="200" max-width="180" contain dark></v-img>

    <v-toolbar-title class="mt-11 ml-5 headline">Open-Source Software Cloud</v-toolbar-title>

    <v-spacer></v-spacer>

    <v-btn color="#1533a1" class="mt-10 mr-2" to="/contributions">Contributions</v-btn>

    <v-btn color="#1533a1" class="mt-10 mr-2" to="/contributors">Contributors</v-btn>

    <AddContributor></AddContributor>
  </v-app-bar>
</template>

<script>
import AddContributor from "./AddContributor.vue";

export default {
  components: { AddContributor }
};
</script>