// routes.js

import ContributorsPage from "./components/ContributorsPage.vue";
import ContributionsPage from "./components/ContributionsPage.vue";

const routes = [{ path: "/", component: ContributorsPage },
                { path: "/contributions", component: ContributionsPage}];

export default routes;
