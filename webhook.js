const request = require('request-promise')
const security = require('./helpers/security')

//TODO: club all auth variables and methods in one file
const auth = {
  twitter_oauth: {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    token: process.env.ACCESS_TOKEN,
    token_secret: process.env.ACCESS_TOKEN_SECRET
  },
  twitter_webhook_environment: process.env.TWITTER_WEBHOOK_ENV
}


var webhook = {}

/**
 * Responds to challenge response check (CRC)
 **/
webhook.get_twitter_crc = function(request, response) {

  var crc_token = request.query.crc_token

  if (crc_token) {
    var hash = security.get_challenge_response(crc_token, auth.twitter_oauth.consumer_secret)

    response.status(200);
    response.send({
      response_token: 'sha256=' + hash
    })
  } else {
    response.status(400);
    response.send('Error: crc_token missing from request.')
  }
}

module.exports = webhook
