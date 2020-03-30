import twitterService from '../services/TwitterService'

const ConversationModule = {
  state: {
    tweets: [],
    tweetReplies: [],
    currentTweet: {}
  },
  mutations: {
    newTweets (state, tweets) {
      state.tweets.unshift(...tweets);
      if (state.tweets.length > 100) {
        state.tweets.splice(-1, 1);
      }
    },
    setTweetReplies (state, tweetReplies) {
      state.tweetReplies = tweetReplies
    },
    pushNewReplies (state, newReplies) {
      state.tweetReplies.push(...newReplies)
    },
    setCurrentTweet (state, tweet) {
      state.currentTweet = tweet
    }
  },
  actions: {
    postTweet (context, payload) {
      //TODO
    },
    //socket event received first time on page load
    socket_tweet ({ dispatch, commit }, tweets) {
      commit('newTweets', tweets)
      commit('setCurrentTweet', tweets[0])
      dispatch('getTweetReplies', tweets[0])
    },
    emit_getTweets ({ dispatch, commit }) {
      this._vm.$socket.client.emit('getTweets');
    },
    getTweetReplies ({ dispatch, commit }, tweet) {
      commit('setCurrentTweet', tweet)
      twitterService.getTweetReplies(tweet).then(response => {
      commit('setTweetReplies', response.data)
      })
    },
    replyToTweet ({ dispatch, commit }, payload) {
      let tweetObj = {status: payload.status, in_reply_to_status_id: payload.tweet.id_str}
      twitterService.postTweet(tweetObj).then(response => {
        commit('pushNewReplies', [response.data])
      })
      .catch(error => {
        console.error(error);
      })
    },
    socket_twitterEvent ({ dispatch, commit }, tweetData) {
      if (tweetData.for_user_id === this.getters.user.id_str && tweetData.tweet_create_events) {
        let newUserTweets = []
        let newTweetReplies = []
        let selectedTweet = this.getters.currentTweet
        for (let i = 0; i < tweetData.tweet_create_events.length; i++) {
          const newTweet = tweetData.tweet_create_events[i]
          if (newTweet.user.id_str === this.getters.user.id_str) {
            newUserTweets.push(newTweet)
          }
          else if (newTweet.in_reply_to_status_id_str === selectedTweet.id_str) {
            newTweetReplies.push(newTweet);
          }
        }
        commit('newTweets', newUserTweets);
        commit('pushNewReplies', newTweetReplies);
      }
    }
  },
  getters: {
    tweets (state) {
      return state.tweets
    },
    tweetReplies (state) {
      return state.tweetReplies
    },
    currentTweet (state) {
      return state.currentTweet
    }
  }
}

export default ConversationModule
