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
    const $heart = $('<button></button>').addClass(`icon ${showUserLikedTweets(tweet, user)}`).attr({
      title: 'Like',
      action: `/tweets/${tweet._id}/${user}`,
      method: 'POST',
    });
    const $retweet = $('<span></span>').addClass('icon retweet-tweet').attr('href', 'javascript:void(0);');
    const $flag = $('<span></span>').addClass('icon flag-tweet').attr('href', 'javascript:void(0);');
    $icons.append($heart);
    $icons.append($retweet);
    $icons.append($flag);
    $footer.append($date, $likes, $icons);

    // entire tweet article
    const $article = $('<article></article>').addClass('tweet');
    $article.append($header, $tweetBody, $footer);
    $article.attr({
      'data-tweetid': tweet._id,
    });
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
      return 'like-tweet-selected';
    }
    return 'like-tweet-deselected';
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

  const clearTextArea = function clearsTextAreaAndResetsCharacterCounter() {
    $('textarea').val('');
    $('.new-tweet').slideUp();
    $('.new-tweet .counter').text(MAX_TWEET_LENGTH);
  };

  const toggleHeartColor = function changesColorOfHeartDependingOnPreviousColor() {
    console.log('toggleHeartColor invoked');
    $('button').toggleClass('like-tweet-selected like-tweet-deselected');
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
          console.log('Tweet submitted');
          loadTweets('newTweetYes');
          clearTextArea();
          console.log('Text area cleared');
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
  const loadTweets = function loadTweetsFromDatabase(newTweet) {
    console.log('loadTweets invoked');
    $.ajax({
      url: '/tweets',
      method: 'GET',
      data: {get_param: 'value'},
      dataType: 'JSON',
      success: function(tweets) {
        if (newTweet === 'newTweetYes') {
          renderTweets([tweets.pop()]);
        } else {
          renderTweets(tweets);
        }
      },
    });
  };

  /* async tweet sumbission to database and rendition on same page */
  const updateTweetLikes = function incrementOrDecrementTweetLikesArray(event) {
    console.log('updateTweetLikes invoked');
    console.log('($(this).closest("article").data("tweetid")): ', ($(this).closest('article').data('tweetid')));
    event.preventDefault();
    // console.log('likeArrayData: ', likeArrayData);
    $.ajax({
      url: $(this).closest('button').attr('action'),
      method: $(this).closest('button').attr('method'),
      contentType: 'application/json',
      dataType: 'JSON',
      data: {id: $(this).closest('article').data('tweetid')},
      success: function() {
        toggleHeartColor();
        console.log('$(this).closest("article"): ', $(this).closest('article'));
        console.log('');
        // loadTweets($(this).closest('article').data('tweetid'));
        // loadTweets(ObjectId('tweetid'));
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

  // $(document).on('click', 'button', toggleHeartColor);
  $(document).on('click', 'button', updateTweetLikes);
  $(document).on('click', 'button', numberOfLikes);

  loadTweets();

});
