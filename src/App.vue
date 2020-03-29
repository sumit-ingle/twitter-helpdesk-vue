<template>
  <v-app>
    <v-app-bar :clipped-left="$vuetify.breakpoint.lgAndUp" app color="blue darken-3" dark>
      <v-app-bar-nav-icon @click.native.stop="drawerToggle = !drawerToggle"></v-app-bar-nav-icon>
      <v-toolbar-title>
        <router-link to="/chat/" tag="span" style="cursor: pointer">Twitter Helpdesk</router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items v-for="item in menuItems" v-bind:key="item.route">
        <v-btn text :key="item.title" @click="item.event">
          <v-icon left>{{ item.icon }}</v-icon>
          <div class="hidden-xs-only">{{ item.title }}</div>
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>
    
    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
  export default {
    data () {
      return {
        drawerToggle: false
      }
    },
    computed: {
      menuItems () {
        let items = [
          // { icon: 'mdi-face', title: 'Register', route: '/register' }, //TODO
          { icon: 'mdi-lock-open', title: 'Login', event: this.login }
        ]
        if (this.userIsAuthenticated) {
          items = [
            {icon: 'mdi-lock', title: 'Logout', route: '/', event: this.logout },
          ]
        }
        return items
      },
      userIsAuthenticated () {
        return this.$store.getters.user !== null && this.$store.getters.user !== undefined
      }
    },
    methods: {
      login () {
        this.$router.push('/login')
      },
      logout () {
        this.$store.dispatch('logout')
      }
    }
  }
</script>