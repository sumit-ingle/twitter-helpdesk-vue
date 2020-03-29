<template>
  <div>
    <div class="tweet" v-for="(tweet,index) in tweets" v-bind:key="index" :class="{own: tweet.user.screen_name == username}">
      <div class="username" v-if="index>0 && tweets[index-1].user.screen_name != tweet.user.screen_name">{{tweet.user.screen_name}}</div>
      <div class="username" v-if="index == 0">{{tweet.user.screen_name}}</div>
      <div style="margin-top: 5px"></div>
      <div class="content">
        <v-row>
          <v-col lg="2">
            <chat-image v-if="tweet.user.profile_image_url" :imgsrc="tweet.user.profile_image_url" @imageLoad="imageLoad"></chat-image>
          </v-col>
          <v-col  md="auto">
            <div v-html="tweet.text"></div>
          </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script>
  import Image from './Image.vue'

  export default {
    data () {
      return {}
    },
    props: [
      'tweets'
    ],
    components: {
      'chat-image': Image
    },
    computed: {
      username () {
        return this.$store.getters.user.screen_name
      }
    },
    methods: {
      imageLoad () {
        // this.$emit('imageLoad')
      }
    }
  }
</script>

<style>
</style>
