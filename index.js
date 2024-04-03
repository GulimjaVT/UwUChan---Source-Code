const conf = require("./config.json");
const uwuifier = require("uwuify");
const uwuify = new uwuifier();
const { ETwitterStreamEvent, TweetStream, TwitterApi, ETwitterApiError } = require('twitter-api-v2');
const { decode } = require("html-entities");

const cli2 = new TwitterApi({
	appKey: conf.twitter.key,
	appSecret: conf.twitter.secret,
	accessToken: conf.twitter.access,
	accessSecret: conf.twitter.asecret
});

async function twitter() {
	let stream = await cli2.v1.filterStream({
		follow: "",
		autoConnect: false,
        tweet_mode: "extended"
	});

	stream.connect({ autoReconnect: true});

	stream.on(ETwitterStreamEvent.Connected, () => console.log("Stream started."));
	
	stream.on(ETwitterStreamEvent.Data, async (tweetData) => {
		if (!tweetData.text) return;
		if (tweetData.text.toLowerCase().startsWith("@")) return;
		if (tweetData.text.toLowerCase().startsWith("rt")) return;
		if (tweetData.in_reply_to_status_id) return;
        if (tweetData.truncated == true) {
            let uwustr = uwuify.uwuify(decode(tweetData.extended_tweet.full_text))
            if (uwustr.length > 280) {
                uwustr = uwustr.substring(0, 277) + "...";
            }
            console.log(`${uwustr}\n${uwustr.length}`)
            await cli2.v1.reply(
                `${uwuify.uwuify(decode(tweetData.extended_tweet.full_text))}`,
                tweetData.id_str
            )
            console.log(`Replied to https://www.twitter.com/${tweetData.user.screen_name}/status/${tweetData.id_str}`)
        } else {
            let uwustr = uwuify.uwuify(decode(tweetData.text))
            if (uwustr.length > 280) {
                uwustr = uwustr.substring(0, 277) + "...";
            }
            console.log(`${uwustr}\n${uwustr.length}`)
            await cli2.v1.reply(
                `${uwustr}`,
                tweetData.id_str
            )
            console.log(`Replied to https://www.twitter.com/${tweetData.user.screen_name}/status/${tweetData.id_str}`)
        }
	})

    stream.on(ETwitterStreamEvent.Error, async (err) => {
        console.log(err)
    })
}

twitter()