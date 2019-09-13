import ContributorsPage from "./components/ContributorsPage.vue";
import ContributionsPage from "./components/ContributionsPage.vue";

const routes = [
  {
    name: "contributorsView",
    path: "/contributors",
    component: ContributorsPage
  },
  {
    name: "contributionsView",
    path: "/contributions",
    component: ContributionsPage
  },
  { path: "/", redirect: "/contributors" }
];

export default routes;
