// routes.js

import ContributorsPage from "./components/ContributorsPage.vue";
import ContributionsPage from "./components/ContributionsPage.vue";

const routes = [{ path: "/contributors", component: ContributorsPage },
                { path: "/contributions", component: ContributionsPage},
                { path: "/", redirect: "/contributors" }];

export default routes;
