<template>
  <div>
    <AddContributor></AddContributor>
    <ContributorsTable></ContributorsTable>
  </div>
</template>

<script>
import AddContributor from "./AddContributor.vue";
import ContributorsTable from "./ContributorsTable.vue";

export default {
  components: { AddContributor, ContributorsTable }
};
</script>
