/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */
'use strict';

$(document).ready(function() {

  const user = '@FrogLife';

  /* Tweet creation */
  const createTweetElement = function createTweetElementFromTweetsDatabase(tweet) {
    console.log('createTweetElement invoked');
    // header section
    const $header = $('<header></header>');
    const $avatar = $('<img>').addClass('avatar');
    $avatar.attr({
      src: tweet.user.avatars.small,
      alt: 'profile picture',
    });
    const $name = $('<h1></h1>').addClass('name').text(tweet.user.name);
    const $handle = $('<h2></h2>').addClass('handle').text(tweet.user.handle);
    $header.append($avatar, $name, $handle);

    // body section
    const $tweetBody = $('<section></section>').addClass('tweet-body');
    const $tweetText = $('<p></p>').addClass('tweet-text').text(tweet.content.text);
    $tweetBody.append($tweetText);

    // footer section
    const $footer = $('<footer></footer>');
    const $date = $('<p></p>').addClass('tweet-date').text(timeSince(tweet.created_at));
    const $likes = $('<p></p>').addClass('tweet-likes').text(numberOfLikes(tweet.likes));
    const $icons = $('<div></div>').addClass('icons');
    const $heart = $('<button></button>').addClass(showUserLikedTweets(tweet, user)).attr({href: 'javascript:void(0);', title: 'Like'});
    const $retweet = $('<span></span>').addClass('icon retweet-tweet').attr('href', 'javascript:void(0);');
    const $flag = $('<span></span>').addClass('icon flag-tweet').attr('href', 'javascript:void(0);');
    $icons.append($heart);
    $icons.append($retweet);
    $icons.append($flag);
    $footer.append($date, $likes, $icons);

    // entire tweet article
    const $article = $('<article></article>').addClass('tweet');
    $article.attr('data-tweetId', tweet._id);
    $article.append($header, $tweetBody, $footer);
    return $article;
  };

  /* tweets in database are rendered on page */
  const renderTweets = function prependEachTweetFromArrayOfTweets(tweets) {
    console.log('renderTweets invoked');
    tweets.forEach(function(tweet) {
      $('#tweets-container').prepend(createTweetElement(tweet));
    });
  };

  /* makes heart red if user likes tweet */
  const showUserLikedTweets = function makeHeartRedIfUserLikesTweet(tweet, user) {
    // console.log('showUserLikedTweets invoked');
    if ((tweet.likes).indexOf(user) > -1) {
      // console.log('handle exists in likes array');
      return 'icon like-tweet-yes';
    }
    return 'icon like-tweet-no';
  };

  /* Tweet form validation */
  const validateTweet = function checkTweetForContentAndLength(tweetText) {
    console.log('validateTweet invoked');
    let errorMessages = [];
    if (!tweetText || tweetText.length === 0) {
      errorMessages.push('There is no content in your tweet. Please type something!');
    }
    if (tweetText.length >= MAX_TWEET_LENGTH) {
      errorMessages.push(`The maximum length for a tweet is ${MAX_TWEET_LENGTH} characters!`);
    }
    return errorMessages;
  };

  /* async tweet sumbission to database and rendition on same page */
  const submitTweet = function postTweetAndRefetchOtherTweets(event) {
    console.log('submitTweet invoked');
    event.preventDefault();
    const errorMessages = validateTweet($(this).find('textarea').val());
    if (errorMessages.length) {
      renderFlashMessage(errorMessages);
    } else {
      let form = $(this);
      $.ajax({
        method: 'POST',
        url: form.attr('action'),
        data: form.serialize(),
        success: function() {
          loadTweets(1);
          $('textarea').val('');
          $('.new-tweet').slideUp();
          $('.new-tweet .counter').text(MAX_TWEET_LENGTH);
        },
      });
    }
    return false;
  };

  /* Flash message rendition */
  const renderFlashMessage = function invalidTweetDialogBox(message) {
    console.log('renderFlashMessage invoked');
    const dialog = $('.flash');
    dialog.find('p').text(message);
    dialog[0].showModal();
  };

  /* async loading of rendered tweets on page */
  const loadTweets = function loadTweetsFromDatabase(option) {
    console.log('loadTweet invoked');
    $.ajax({
      url: '/tweets',
      method: 'GET',
      success: function(tweets) {
        if (option === 1) {
          renderTweets([tweets.pop()]);
        } else {
          renderTweets(tweets);
        }
      },
    });
  };

  /* async tweet sumbission to database and rendition on same page */
  const updateTweetLikesArray = function incrementOrDecrementTweetLikes(event) {
    console.log('updateTweetLikesArray invoked');
    event.preventDefault();
    let tweetId = $(this).closest('article').data(tweetId);
    $.ajax({
      method: 'POST',
      url: '/tweets',
      data: {id: $(this).closest('article').data('tweetId'), option: $(this).data('liked')},
      dataType: 'json',
      success: function(rsponse) {
        numberOfLikes(response);
        console.log('numberOfLikes(response): ', numberOfLikes(response));
        heartColor((response.likes), user);
        console.log('heartColor(response.likes, user): ', heartColor((response.likes), user));
      },
    });
  };

  /* New tweet is hidden to begin with */
  const newTweet = $('.new-tweet');
  newTweet.hide();

  /* Compose button behaviour */
  $('.compose').on('click', function() {
    $('.new-tweet').slideToggle();
    $('.new-tweet textarea').focus();
    $('.new-tweet .counter').text(MAX_TWEET_LENGTH);
  });

  /* Tweet form submission calls submitTweet function */
  $('#tweet-submission-form').on('submit', submitTweet);

  /* Flash message behaviour in the event of an invalid tweet form */
  $('dialog').on('click', '.close', function(event) {
    $(this).parent()[0].close();
  });

  /* Tweet button behaviour */
  // $('.like-tweet').on('click', updateTweetLikesArray);
  $(document).on('click', 'button.icon.like-tweet-no, button.icon.like-tweet-yes', function(event) {
    event.preventDefault();
    console.log('like button clicked');
    // return false;
  });

  loadTweets();

});
