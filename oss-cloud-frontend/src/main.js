import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import VueRouter from "vue-router";
import routes from "./routes";
import Amplify from "aws-amplify";

Amplify.configure({
  Auth: {
    region: "eu-west-2",
    userPoolId: "eu-west-2_2aQvY62eG",
    userPoolWebClientId: "vvm7p9a6ol3i4j6qkvshbtpn7"
  }
});

Vue.use(VueRouter);
Vue.config.productionTip = false;

const router = new VueRouter({ routes });

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount("#app");
