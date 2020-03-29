<template>
  <v-list subheader three-line>
        <v-subheader>Latest Tweets</v-subheader>
        <template v-for="(item, index) in tweets">
          <v-list-item
            :to="/chat/ + index"
            :key="item.id"
            @click="getReplyTweets()"
          >
            <v-list-item-avatar>
              <v-img :src="item.user.profile_image_url"></v-img>
            </v-list-item-avatar>
  
            <v-list-item-content>
              <v-list-item-title v-html="item.user.name"></v-list-item-title>
              <v-list-item-subtitle v-html="item.text"></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          
          <v-divider
            :key="index"
            :inset="true"
          ></v-divider>
        </template>
      </v-list>
</template>

<script>
  export default {
    beforeCreate () {
      this.$store.dispatch('emit_getTweets');
    },
    created () {
      //TODO: find alternative way to do this.
      setInterval(() => {
        this.$store.dispatch('emit_getTweets');
      }, 8000);
      // this.$store.dispatch('loadUserChats')
    },
    computed: {
      tweets () {
        return this.$store.getters.tweets
      }
    },
    methods: {
      getReplyTweets() {

      }
    }
  }
</script>
