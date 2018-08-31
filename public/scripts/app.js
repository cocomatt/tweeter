/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

// Fake data taken from tweets.json
$(document).ready(function() {


const tweetObj = {
  'user': {
    'name': 'Newton',
    'avatars': {
      'small':   'https://vanillicon.com/788e533873e80d2002fa14e1412b4188_50.png',
      'regular': 'https://vanillicon.com/788e533873e80d2002fa14e1412b4188.png',
      'large':   'https://vanillicon.com/788e533873e80d2002fa14e1412b4188_200.png'
    },
    'handle': '@SirIsaac'
  },
  'content': {
    'text': 'If I have seen further it is by standing on the shoulders of giants'
  },
  'created_at': 1461116232227
};

const data = [
  {
    'user': {
      'name': 'Newton',
      'avatars': {
        'small':   'https://vanillicon.com/788e533873e80d2002fa14e1412b4188_50.png',
        'regular': 'https://vanillicon.com/788e533873e80d2002fa14e1412b4188.png',
        'large':   'https://vanillicon.com/788e533873e80d2002fa14e1412b4188_200.png'
      },
      'handle': '@SirIsaac'
    },
    'content': {
      'text': 'If I have seen further it is by standing on the shoulders of giants'
    },
    'created_at': 1461116232227
  },
  {
    'user': {
      'name': 'Descartes',
      'avatars': {
        'small':   'https://vanillicon.com/7b89b0d8280b93e2ba68841436c0bebc_50.png',
        'regular': 'https://vanillicon.com/7b89b0d8280b93e2ba68841436c0bebc.png',
        'large':   'https://vanillicon.com/7b89b0d8280b93e2ba68841436c0bebc_200.png'
      },
      'handle': '@rd' },
    'content': {
      'text': 'Je pense , donc je suis'
    },
    'created_at': 1461113959088
  },
  {
    'user': {
      'name': 'Johann von Goethe',
      'avatars': {
        'small':   'https://vanillicon.com/d55cf8e18b47d4baaf60c006a0de39e1_50.png',
        'regular': 'https://vanillicon.com/d55cf8e18b47d4baaf60c006a0de39e1.png',
        'large':   'https://vanillicon.com/d55cf8e18b47d4baaf60c006a0de39e1_200.png'
      },
      'handle': '@johann49'
    },
    'content': {
      'text': 'Es ist nichts schrecklicher als eine tätige Unwissenheit.'
    },
    'created_at': 1461113796368
  }
];


function createTweetElement (tweet) {
  // header section
  let $header = $("<header></header>");
  let $avatar = $("<img>").addClass("avatar");
  $avatar.attr({ src: tweet.user.avatars.small, alt: "profile picture" })
  let $name = $("<h1></h1>").addClass("name").text(tweet.user.name);
  let $handle = $("<h2></h2>").addClass("handle").text(tweet.user.handle);
  $header.append($avatar);
  $header.append($name);
  $header.append($handle);

  // body section
  let $tweetBody = $("<section></section>").addClass("tweet-body");
  let $tweetText = $("<p></p>").addClass("tweet-text").text(tweet.content.text);
  $tweetBody.append($tweetText);

  // footer section
  let $footer = $("<footer></footer>");
  let $date = $("<p></p>").addClass("tweet-date").text(tweet.created_at);
  let $icons = $("<div></div>");
  $icons.append($("<span><a href=''><i class='fas fa-heart'></i></a></span>").addClass("icon"));
  $icons.append($("<span><a href=''><i class='fas fa-retweet'></i></a></span>").addClass("icon"));
  $icons.append($("<span><a href=''><i class='fas fa-flag'></i></a></span>").addClass("icon"));

  $footer.append($date);
  $footer.append($icons);

  // entire tweet article
  let $article = $("<article></article>").addClass("tweet");
  $article.append($header);
  $article.append($tweetBody);
  $article.append($footer);
  return $article;
}

function renderTweets (tweets) {
  tweets.forEach(function(tweet) {
    console.log(createTweetElement(tweet));
    $("#tweets-container").append(createTweetElement(tweet));
  });
}
// Test / driver code (temporary)
// $('#tweets-container').append($tweet); // to add it to the page so we can make sure it's got all the right elements, classes, etc.
  renderTweets(data);
});
