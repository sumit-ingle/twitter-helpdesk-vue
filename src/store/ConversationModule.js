import twitterService from '../services/TwitterService'

const ConversationModule = {
  state: {
    tweets: [],
    tweetReplies: []
  },
  mutations: {
    newTweets (state, tweets) {
      state.tweets.unshift(...tweets);
      if (state.tweets.length > 100) {
        state.tweets.splice(-1, 1);
      }
    },
    setTweetReplies (state, tweetReplies) {
      state.tweetReplies = tweetReplies;
    },
    pushTweetToConversation (state, tweet) {
      state.tweetReplies.push(tweet);
    }
  },
  actions: {
    postTweet (context, payload) {
      //TODO
    },
    socket_tweet ({ dispatch, commit }, tweets) {
      commit('newTweets', tweets);
    },
    emit_getTweets ({ dispatch, commit }) {
      this._vm.$socket.client.emit('getTweets');
    },
    getTweetReplies ({ dispatch, commit }, tweet) {
      twitterService.getTweetReplies(tweet).then(response => {
      commit('setTweetReplies', response.data)
      })
    },
    replyToTweet ({ dispatch, commit }, payload) {
      let tweetObj = {status: payload.status, in_reply_to_status_id: payload.tweet.id_str}
      twitterService.postTweet(tweetObj).then(response => {
        commit('pushTweetToConversation', response.data)
      })
      .catch(error => {
        console.error(error);
      })
    }
  },
  getters: {
    tweets (state) {
      return state.tweets
    },
    tweetReplies (state) {
      return state.tweetReplies
    } 
  }
}

export default ConversationModule
