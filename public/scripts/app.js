/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

$(document).ready(function() {

/* Fake data taken from tweets.json
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
      'created_at': 1535454000000
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
      'created_at': 1535746614641
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
      'created_at': 1524958200000
    }
  ];
*/
  function timeSince(date) {
    // https://stackoverflow.com/a/3177838/7950458
    let seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
      return interval + " years ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + " months ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + " days ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + " hours ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  }

  function createTweetElement (tweet) {
    // header section
    const $header = $("<header></header>");
    const $avatar = $("<img>").addClass("avatar");
    $avatar.attr({ src: tweet.user.avatars.small, alt: "profile picture" })
    const $name = $("<h1></h1>").addClass("name").text(tweet.user.name);
    const $handle = $("<h2></h2>").addClass("handle").text(tweet.user.handle);
    $header.append($avatar);
    $header.append($name);
    $header.append($handle);

    // body section
    const $tweetBody = $("<section></section>").addClass("tweet-body");
    const $tweetText = $("<p></p>").addClass("tweet-text").text(tweet.content.text);
    $tweetBody.append($tweetText);

    // footer section
    const $footer = $("<footer></footer>");
    const $date = $("<p></p>").addClass("tweet-date").text(timeSince(tweet.created_at));
    const $icons = $("<div></div>");
    $icons.append($("<span><a href=''><i class='fas fa-heart'></i></a></span>").addClass("icon"));
    $icons.append($("<span><a href=''><i class='fas fa-retweet'></i></a></span>").addClass("icon"));
    $icons.append($("<span><a href=''><i class='fas fa-flag'></i></a></span>").addClass("icon"));

    $footer.append($date);
    $footer.append($icons);

    // entire tweet article
    const $article = $("<article></article>").addClass("tweet");
    $article.append($header);
    $article.append($tweetBody);
    $article.append($footer);
    return $article;
  }

  function renderTweets (tweets) {
    tweets.forEach(function(tweet) {
      $("#tweets-container").append(createTweetElement(tweet));
    });
  }

  function validateTweet (tweetText) {
    const MAX_TWEET_LENGTH = 140;
    let errorMessages = [];
    if (!tweetText || tweetText.length === 0) {
      errorMessages.push("There is no content in your tweet. Please type something!")
    }
    if (tweetText.length >= MAX_TWEET_LENGTH) {
      errorMessages.push(`The maximum length for a tweet is ${MAX_TWEET_LENGTH} characters`);
    }
    return errorMessages;
  }

  function submitTweet (event) {
    event.preventDefault();
    const errorMessages = validateTweet($(this).find('textarea').val());
    if (errorMessages.length) {
      renderFlashMessage(errorMessages);
    } else {
      let form = $(this);
      $.ajax({
        method: "POST",
        url: form.attr("action"),
        data: form.serialize(),
        success: function(response) {
          console.log("Tweet submitted");
        }
      });
    }
    return false;
  }

  function renderFlashMessage (message) {
    const dialog = $('.flash');
    dialog.find('p').text(message);
    dialog[0].showModal();
  }

  function loadTweets () {
    $.ajax({
      url: "/tweets",
      method: "GET",
      success: function(response) {
        renderTweets(response);
        console.log("Success: ", response);
      }
    });
  }

  loadTweets();
  $("#tweet-submission-form").on("submit", submitTweet);
  $('dialog').on('click', '.close', function(event) { $(this).parent()[0].close(); });
});
