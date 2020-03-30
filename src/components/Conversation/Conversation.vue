<template>
  <v-container fluid style="padding: 0;">
    <v-row no-gutters>
      <v-col sm="3" class="scrollable">
        <chats></chats>
      </v-col>
      <v-col sm="9" style="position: relative;">
        <div class="chat-container" v-if="id == undefined" ref="chatContainer" >
          Select a tweet to begin...
        </div>
        <div class="chat-container" v-on:scroll="onScroll" ref="chatContainer" >
          <message :tweets="tweets" @imageLoad="scrollToEnd"></message>
        </div>
        <div class="typer">
          <input type="text" placeholder="Type here and press enter..." v-on:keyup.enter="replyToTweet" v-model="content">
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import Message from './parts/Message.vue'
  import Chats from './parts/Chats.vue'

  export default {
    data () {
      return {
        content: '',
        loading: false,
        totalChatHeight: 0
      }
    },
    props: [
      'id'
    ],
    mounted () {
      this.loadConversation()
    },
    components: {
      'message': Message,
      'chats': Chats
    },
    computed: {
      tweets () {
        return this.$store.getters.tweetReplies
      },
      username () {
        return this.$store.getters.user.screen_name
      }
    },
    watch: {
      '$route.params.id' (newId, oldId) {
        this.loadConversation()
      },
      tweets (newReplies, oldReplies) {
        this.scrollToEnd()
      }
    },
    methods: {
      loadConversation () {
        this.totalChatHeight = this.$refs.chatContainer.scrollHeight
        this.loading = false
        if (this.id !== undefined) {
          this.chatMessages = []
          let chatID = Number(this.id)
          let tweet = this.$store.getters.tweets[chatID]
          this.$store.dispatch('getTweetReplies', tweet);
        }
      },
      onScroll () {
      },
      replyToTweet () {
        if (this.content !== '') {
          let currentTweetNumber = Number(this.id)
          let selectedTweet = this.$store.getters.tweets[currentTweetNumber]
          let tweetReplies = this.$store.getters.tweetReplies;
          let tweetToReply; //the tweet to reply against
          if (tweetReplies && tweetReplies.length > 0) {
            let lastReplyId = tweetReplies.length - 1
            //get last reply from some user other than logged in user
            while (tweetReplies[lastReplyId].user.screen_name == this.username && lastReplyId >= 0) {
              lastReplyId--;
            }
            //if conversation thread contains tweets tweeted only by logged in user
            if (lastReplyId == -1) {
              lastReplyId = tweetReplies.length - 1
            }
            tweetToReply = tweetReplies[lastReplyId];
          } else {
            tweetToReply = selectedTweet
          }
          this.$store.dispatch('replyToTweet', {status: `@${tweetToReply.user.screen_name} ${this.content}`, tweet: tweetToReply});
          this.content = ''
        }
      },
      scrollToEnd () {
        this.$nextTick(() => {
          var container = this.$el.querySelector('.chat-container')
          container.scrollTop = container.scrollHeight
        })
      },
      scrollTo () {
        this.$nextTick(() => {
          let currentHeight = this.$refs.chatContainer.scrollHeight
          let difference = currentHeight - this.totalChatHeight
          var container = this.$el.querySelector('.chat-container')
          container.scrollTop = difference
        })
      },
    }
  }
</script>

<style>
  .scrollable {
    overflow-y: auto;
    height: 90vh;
  }
  .typer{
    box-sizing: border-box;
    display: flex;
    align-items: center;
    bottom: 0;
    height: 4.9rem;
    width: 100%;
    background-color: #fff;
    box-shadow: 0 -5px 10px -5px rgba(0,0,0,.2);
  }
  .typer input[type=text]{
    position: absolute;
    left: 2.5rem;
    padding: 1rem;
    width: 80%;
    background-color: transparent;
    border: none;
    outline: none;
    font-size: 1.25rem;
  }
  .chat-container{
    box-sizing: border-box;
    height: calc(100vh - 9.5rem);
    overflow-y: auto;
    padding: 10px;
    background-color: #f2f2f2;
  }
  .message{
    margin-bottom: 3px;
  }
  .message.own{
    text-align: right;
  }
  .message.own .content{
    background-color: #E3F2FD;
  }
  .chat-container .username{
    font-size: 18px;
    font-weight: bold;
  }
  .chat-container .content{
    padding: 8px;
    background-color: #f7f7f7;
    border-radius: 10px;
    display:inline-block;
    box-shadow: 0 1px 3px 0 rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.14), 0 2px 1px -1px rgba(0,0,0,0.12);
    max-width: 50%;
    word-wrap: break-word;
    }
  @media (max-width: 480px) {
    .chat-container .content{
      max-width: 60%;
    }
  }

</style>
