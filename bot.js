console.log("The twitter internship bot is starting.");

var Twit = require("twit");

var config = require("./config");
var T = new Twit(config);

/*
For since_id, Ref: https://dev.twitter.com/rest/reference/get/search/tweets
Also: https://dev.twitter.com/rest/public/timelines
*/

var since_id_current = 0;
var search_query = "#internship OR internship filter:links"; 
var twitter_screen_name = "ifindinternship"; 

//
// Get the most recent tweet id of the handle and assign to since_id_current
//
function find_since_id_current(handle) {
	console.log("Finding since_id_current.");
	var params = {
		screen_name: handle,
		count: 1 // get single tweet
	}

	T.get('statuses/user_timeline', params, cb);
	
	function cb(err, data, response) {
		if(!err && data.length > 0)
			since_id_current = data[0].id_str;
	}
}

//
// Fetch the tweets from twiter and retweet
//
function fetchTweets() {
	console.log("Fetching tweets.");
	var params = {
		q: search_query,
		lang: "en", // Process only English tweets
		count: 5, // Process 5 tweets in a batch
		since_id: since_id_current
	}

	T.get('search/tweets', params, gotTweets);

	function gotTweets(err, data, response) {
		if(err) {
			console.log("Error in receiveing tweets. " + err);
		}
		else {
			var tweets = data.statuses;
			if(tweets.length > 0) {
				// Update the since_id_current parameter to the latest tweet
				since_id_current = tweets[0].id_str;

				for (var i = tweets.length - 1; i >= 0; i--) {
					// console.log(tweets[i].id + " " + tweets[i].text);
					retweet(tweets[i].id_str);

					// sleep for random time between 60 to 120 seconds.
					// var sleeptime = (tweets.length - i) * Math.floor(((Math.random() * 1000) % 61) + 60);
					// setTimeout(retweet(tweets[i].id_str),sleeptime * 1000);
				}
			}
		}
	}
}

//
// Retweet a tweet with given id of the tweet
//
function retweet(retweet_id) {
	var params = {
		id: retweet_id
	}

	T.post('statuses/retweet/:id', params, retweeted);

	function retweeted(err, data, response) {
		if(err) {
			console.log("Error in retweeting tweet with id: " + retweet_id);
			console.log(err);
		}
		else {
			console.log("Retweet successful: " + retweet_id);
		}
	}
}

find_since_id_current(twitter_screen_name);
// fetch tweets every 20 minutes
setInterval(fetchTweets, 1000 * 60 * 20);
// fetchTweets();