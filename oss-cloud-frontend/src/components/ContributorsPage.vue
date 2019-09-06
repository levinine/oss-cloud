<template>
  <div>
    <v-container fill-heigh>
      <ContributorsTable></ContributorsTable>
    </v-container>
  </div>
</template>

<script>
import ContributorsTable from "./ContributorsTable.vue";

export default {
  components: { ContributorsTable }
};
</script>
