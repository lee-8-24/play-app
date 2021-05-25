import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import konva from "vue-konva";
import SuiVue from "semantic-ui-vue";
import dataV from "@jiaminghi/data-view";
import Carousel3d from "vue-carousel-3d";
import VueScrollTo from "vue-scrollto";
import EasySlider from "vue-easy-slider";
import "semantic-ui-css/semantic.min.css";

Vue.config.productionTip = false;

Vue.use(konva);
Vue.use(SuiVue);
Vue.use(dataV);
Vue.use(Carousel3d);
Vue.use(VueScrollTo);
Vue.use(EasySlider);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
