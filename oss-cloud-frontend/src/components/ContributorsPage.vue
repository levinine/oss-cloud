<template>
  <ContributorsTable :loggedIn="loggedIn"></ContributorsTable>
</template>

<script>
import ContributorsTable from "./ContributorsTable.vue";

export default {
  components: { ContributorsTable },
  props: ["loggedIn"]
};
</script>
