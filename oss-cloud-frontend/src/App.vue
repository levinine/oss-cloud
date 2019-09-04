<template>
  <v-app>
    <v-content>
      <Header></Header>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
import Header from "./components/Header.vue";
export default {
  name: "App",
  components: { Header }
};
</script>


<style scoped lang="scss">
@import url("https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons");
</style>
