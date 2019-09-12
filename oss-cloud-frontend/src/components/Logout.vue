<template>
  <v-btn color="#1533a1" class="mt-10 mr-2" @click="logout">Log out</v-btn>
</template>

<script>
import { Auth } from "aws-amplify";

export default {
  methods: {
    logout() {
      Auth.signOut().then(() => {
        this.$emit('logout');
      });
    }
  }
};
</script>
