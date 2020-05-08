import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import VueRouter from "vue-router";
import routes from "./routes";
import Amplify from "aws-amplify";

Amplify.configure({
  Auth: {
    region: "eu-west-1",
    userPoolId: "eu-west-1_6xVKqbX2o",
    userPoolWebClientId: "1ci44sfkcdqeskfjnsig9gt62a"
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
