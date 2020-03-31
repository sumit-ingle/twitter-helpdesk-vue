'use strict';

const express = require('express');
const serveStatic = require('serve-static')
const path = require('path')
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session')({secret: "ywNiTXWVnCQ59ajo1g6a",
                                            resave: false,
                                            saveUninitialized: false,
                                            cookie: { httpOnly: true }});
const inspect = require('util-inspect');
const request = require('request');
const querystring = require('querystring');
const cors = require('cors');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const sharedsession = require("express-socket.io-session");

const corsOption = {
  origin: true,
  methods: 'GET,POST',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

const port = process.env.PORT || 8080
const twitterApiURL = "https://api.twitter.com/1.1";
const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;
const maxApiCallsForReplies = 5;

const oauthMiddleware = (req, res, next) => {
  req.oauth = {
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
    token: req.session.oauth ? req.session.oauth.token : "",
    token_secret: req.session.oauth ? req.session.oauth.token_secret : ""
  }
  next();
}

app.use('/', serveStatic(path.join(__dirname, '/dist')))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session);
io.use(sharedsession(session));

app.get(/^((?!api|webhook).)*$/, function (req, res) {
	res.sendFile(path.join(__dirname, '/dist/index.html'))
})

app.get('/api/login', (req, res) => {
  // OAuth step 1
  let oauth = {
            // callback: 'http://127.0.0.1:8080/api/login/callback',
            callback: 'https://vue-twitter-dashboard.herokuapp.com/api/login/callback',
            consumer_key: consumerKey,
            consumer_secret: consumerSecret
  };
  let tokenUrl = 'https://api.twitter.com/oauth/request_token';

  request.post({url:tokenUrl, oauth:oauth}, (e, r, body) => {
    if (e || r.statusCode !== 200) {
      res.status(500).send({message: "Error getting OAuth request token : " + inspect(e)});
    } else {
      // OAuth step 2
      let tokenData = querystring.parse(body)
      let authUrl = 'https://api.twitter.com/oauth/authenticate'
        + '?' + querystring.stringify({oauth_token: tokenData.oauth_token});
      req.session.oauthRequestToken = tokenData.oauth_token;
      req.session.oauthRequestTokenSecret = tokenData.oauth_token_secret;
      res.send({url: authUrl});
    }
  });
});

app.get('/api/login/callback', (req, res) => {
  let authData = req.query;
  let oauth =
      {
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        token: authData.oauth_token,
        token_secret: req.session.oauthRequestTokenSecret,
        verifier: authData.oauth_verifier
      };
  let url = 'https://api.twitter.com/oauth/access_token';

  // OAuth step 3
  request.post({url: url, oauth: oauth}, (e, r, body) => {
    let permAuthData = querystring.parse(body);
    req.session.oauth = {};
    req.session.oauth.token = permAuthData.oauth_token;
    req.session.oauth.token_secret = permAuthData.oauth_token_secret;
    req.session.oauth.screen_name = permAuthData.screen_name;
    req.session.oauth.user_id = permAuthData.user_id;

    oauth.token = permAuthData.oauth_token;
    oauth.token_secret = permAuthData.oauth_token_secret;
    request.post({
      url: `${twitterApiURL}/account_activity/all/dev/subscriptions.json`,
      oauth: oauth
    }, (e, r, body) => {
      // res.redirect('http://127.0.0.1:8080/');
      res.redirect('https://vue-twitter-dashboard.herokuapp.com');
      console.log(`subscription status: ${body}`);
    })
  });
});

app.get('/api/logout', (req, res) => {
  if (req.session.oauth) {
    req.session.oauth = null;
    res.status(200).send({message: 'User logged out succesfully.'});
  } else {
    res.status(500).send({message: 'User already logged out.'})
  }
});

app.get('/api/is-logged', (req, res) => {
  if (req.session.oauth) {
    res.status(200).send({logged: true});
  } else {
    res.status(200).send({logged: false});
  }
});

app.get('/api/user', oauthMiddleware, (req, res) => {
  if (req.session.oauth) {
    let url = 'https://api.twitter.com/1.1/account/verify_credentials.json';
    request.get({url: url, oauth: req.oauth}, (e, r, body) => {
      if (e || r.statusCode !== 200) {
        res.status(500).send({message: 'Error getting user data : ' + inspect(e)});
      } else {
        res.status(200).send(body);
      }
    });
  } else {
    res.status(200).send(null);
  }
});

//to get all the tweets on authenticated user's home timeline
app.get('/api/tweets', oauthMiddleware, (req, res) => {
  let url = 'https://api.twitter.com/1.1/statuses/home_timeline.json?screen_name='
            + req.session.oauth.screen_name
            + '&count=10';
  request.get({url: url, oauth: req.oauth}, (e, r, body) => {
    if (e || r.statusCode !== 200) {
      res.status(500).send({message: 'Error getting user tweets : ' + inspect(e)});
    } else {
      res.status(200).send(body);
    }
  });
});

app.post('/api/tweetReplies', oauthMiddleware, (req, res) => {
  let requestTweet = req.body.data;
  let url = 'https://api.twitter.com/1.1/search/tweets.json?q=to%3A' + requestTweet.user.screen_name
            + '&since_id' + requestTweet.id_str;
            // + '&count=10';
  request.get({url: url, oauth: req.oauth}, (e, r, body) => {
    if (e || r.statusCode !== 200) {
      res.status(500).send({message: 'Error getting user tweets : ' + inspect(e)});
    } else {
      let searchData = JSON.parse(body);
      let replies = [];
      let searchTweetId = requestTweet.retweeted ? requestTweet.retweeted_status.id_str : requestTweet.id_str;
      for (let i = 0; i < searchData.statuses.length; i++) {
        if (searchData.statuses[i].in_reply_to_status_id_str === searchTweetId) {
          replies.push(searchData.statuses[i]);
        }
      }
      replies.sort((t1, t2) => {
        return (new Date(t1.created_at).getTime() - new Date(t2.created_at).getTime())
      });
      res.status(200).send(replies);
    }
  });
});

app.post('/api/tweetReplies/new', oauthMiddleware, (req, res) => {
  fireTwitterSearchApi(req, res, maxApiCallsForReplies, []);
});

function fireTwitterSearchApi (req, res, count, finalResult) {
  let requestTweet = req.body.data;
  let url = 'https://api.twitter.com/1.1/search/tweets.json?q=%40' + requestTweet.user.screen_name
            + '&since_id' + requestTweet.id_str;
            // + '&count=10';
  request.get({url: url, oauth: req.oauth}, function getTweetReplies (e, r, body) {
    if (e || r.statusCode !== 200) {
      res.status(500).send({message: 'Error getting user tweets : ' + inspect(e)});
    } else {
      let searchData = JSON.parse(body);
      if (searchData && searchData.statuses) {
        let searchTweetId = requestTweet.retweeted ? requestTweet.retweeted_status.id_str : requestTweet.id_str;
        let replies = searchData.statuses.filter(tweet => tweet.in_reply_to_status_id_str === searchTweetId);
        if (replies && replies.length > 0 && count > 0) {
          replies.sort((t1, t2) => {
            return (new Date(t1.created_at).getTime() - new Date(t2.created_at).getTime())
          });
          finalResult.push(...replies);
          let latestReply = finalResult[finalResult.length - 1];
            req.body.data = latestReply;
            count--;
            fireTwitterSearchApi(req, res, count, finalResult);
        }
        else {
          res.status(200).send(finalResult);
        }
      }
    }
  });
}

app.post('/api/tweets', oauthMiddleware, (req, res) => {
  let url = 'https://api.twitter.com/1.1/statuses/update.json?'
            + querystring.stringify(req.body);
  request.post({url: url, oauth: req.oauth}, (e, r, body) => {
    if (e || r.statusCode !== 200) {
      res.status(500).send({message: 'Error posting new tweet : ' + inspect(e)});
    } else {
      res.status(200).send(body);
    }
  });
});

io.sockets.on('connection', function (socket) {
  console.log('Connected');
  //   T.stream('statuses/filter', options, function (stream) {
  //   stream.on('tweet', function (tweet) {
  //         io.sockets.emit('tweet', tweet.text);
  //         console.log(tweet.text);
  //   });
  //  });
    let since_id = null;
    socket.on('getTweets', function (data) {
      if (socket.handshake.session.oauth) {
        let session_oauth = socket.handshake.session.oauth;
        session_oauth.consumer_key = consumerKey;
        session_oauth.consumer_secret = consumerSecret;
        let since_param = since_id !== null ? ('&since_id=' + since_id) : '';
        //using user_timeline API instead of home_timeline since home_timeline is imposing rate limits
        let url = 'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name='
            + session_oauth.screen_name
            + since_param
            + '&count=10';
        request.get({url: url, oauth: session_oauth}, (e, r, body) => {
            if (e || r.statusCode !== 200) {
              console.log(e);
            } else {
              let tweets = JSON.parse(body);
              console.log(tweets);
              if(tweets.length > 0) {
                let latest_tweet = tweets.reduce((max, tweet) => new Date(max.created_at).getTime() > new Date(tweet.created_at).getTime() ? max : tweet);
                since_id = latest_tweet.id_str;
              }
              socket.emit('tweet', tweets);
            }
        });
      }
    })

    // setInterval(() => {
    //   let since_param = since_id !== null ? ('&since_id=' + since_id) : '';
    //   let url = 'https://api.twitter.com/1.1/statuses/home_timeline.json?screen_name='
    //           + session_oauth.screen_name
    //           + since_param
    //           + '&count=10';
    //   // if (since_id == null || (old_since_id !== since_id)) {
    //     request.get({url: url, oauth: session_oauth}, (e, r, body) => {
    //         if (e || r.statusCode !== 200) {
    //           // r.status(500).send({message: 'Error getting user tweets : ' + inspect(e)});
    //           console.log(e);
    //         } else {
    //           let tweets = JSON.parse(body);
    //           console.log(tweets);
    //           if(tweets.length > 0) {
    //             let latest_tweet = tweets.reduce((max, tweet) => new Date(max.created_at).getTime() > new Date(tweet.created_at).getTime() ? max : tweet);
    //             since_id = latest_tweet.id_str;
    //           }
    //           io.emit('tweet', tweets);
    //         }
    //     });
    //   // }
    //   // old_since_id = since_id == null ? 0 : since_id;
    // }, 10000);
});

// userActivityWebhook.on ('event', (event, userId, data) => console.log (userId + ' - favorite'));

//using this webhook for listening to twitter replies.
app.post('/webhook/twitter', function(request, response) {
  console.log(request.body);
  let tweetData = request.body;
  io.emit('twitterEvent', tweetData);
  response.send('200 OK');
})

var webhook_route = require('./webhook')
app.get('/webhook/twitter', webhook_route.get_twitter_crc)

server.listen(port, function() {
  console.log(`app is listening on port: ${port}`);
});
