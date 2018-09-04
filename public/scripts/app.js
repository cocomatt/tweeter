/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

$(document).ready(function() {

  /* Tweet creation */
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

  /* tweets in database are rendered on page */
  function renderTweets (tweets) {
    tweets.forEach(function(tweet) {
      $("#tweets-container").prepend(createTweetElement(tweet));
    });
  }

  /* Tweet form validation */
  function validateTweet (tweetText) {
    const MAX_TWEET_LENGTH = 140;
    let errorMessages = [];
    if (!tweetText || tweetText.length === 0) {
      errorMessages.push("There is no content in your tweet. Please type something!")
    }
    if (tweetText.length >= MAX_TWEET_LENGTH) {
      errorMessages.push(`The maximum length for a tweet is ${MAX_TWEET_LENGTH} characters!`);
    }
    return errorMessages;
  }

  /* async tweet sumbission to database and rendition on same page */
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
        success: function () {
          loadTweets();
          $("textarea").val("");
          $(".new-tweet").slideUp();
        }
      });
    }
    return false;
  }

  /* Flash message behaviour on tweet invalidation */
  function renderFlashMessage (message) {
    const dialog = $(".flash");
    dialog.find("p").text(message);
    dialog[0].showModal();
  }

  /* async loading of rendered tweets on page */
  function loadTweets () {
    $.ajax({
      url: "/tweets",
      method: "GET",
      success: function(response) {
        renderTweets(response);
      }
    });
  }

  /* New tweet behaviour */
  const newTweet = $(".new-tweet");
  newTweet.hide();
  $("#tweet-submission-form").on("submit", submitTweet);
  $('dialog').on('click', '.close', function(event) {
    $(this).parent()[0].close();
  });

  /* Compose button behaviour */
  $(".compose").on("click", function() {
    $(".new-tweet").slideToggle();
    $(".new-tweet textarea").focus();
  });

  loadTweets();
});
