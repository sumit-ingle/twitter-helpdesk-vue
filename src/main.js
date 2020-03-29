import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import { store } from './store'
import AlertComponent from './components/Shared/Alert.vue'
import AuthService from './services/AuthService';
import VueSocketio from "vue-socket.io-extended";
import io from "socket.io-client";

Vue.use(VueSocketio, io("http://127.0.0.1:8080"), {store});

Vue.config.productionTip = false
Vue.component('app-alert', AlertComponent)

AuthService.getUser().then(user => {
  store.commit('setUser', user.data == "" ? null : user.data);
  new Vue({
    vuetify,
    router,
    store,
    render: h => h(App),
    created () {
    }
  }).$mount('#app')
});