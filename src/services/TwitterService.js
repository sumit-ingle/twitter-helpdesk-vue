import Api from '@/services/BaseApi'

export default {
    getTweetReplies (data) {
        return Api().post('/tweetReplies', {data: data});
    },
    postTweet (tweet) {
        return Api().post('/tweets', tweet);
    }
}