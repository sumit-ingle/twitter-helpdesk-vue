<template>
  <v-list subheader three-line>
        <v-subheader>Latest Tweets</v-subheader>
        <v-list-item-group v-model="item" color="primary">
          <template v-for="(item, index) in tweets">
            <v-list-item
              :key="item.id_str"
              @click="getReplyTweets(item)"
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
        </v-list-item-group>
      </v-list>
</template>

<script>
  export default {
    data () {
      return { item: 0 }
    },
    beforeCreate () {
      this.$store.dispatch('emit_getTweets');
    },
    created () {
      //TODO: find alternative way to do this.
      // setInterval(() => {
      //   this.$store.dispatch('emit_getTweets');
      // }, 8000);
      // this.$store.dispatch('loadUserChats')
    },
    computed: {
      tweets () {
        return this.$store.getters.tweets
      }
    },
    methods: {
      getReplyTweets(tweet) {
        this.$store.dispatch('getTweetReplies', tweet);
      }
    }
  }
</script>
