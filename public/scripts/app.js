/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */
'use strict';

$(document).ready(function() {

  // const user = '@FrogLife';
  const user = '@PigLife88';

  const ajaxErrors = function ajaxErrorHandler(jqXHR, exception) {
    if (jqXHR.status === 0) {
      alert('Not connected.\n Verify Network.');
    } else if (jqXHR.status === 404) {
      alert('Requested page not found. [404]');
    } else if (jqXHR.status === 500) {
      alert('Internal Server Error [500].');
    } else if (exception === 'parsererror') {
      alert('Requested JSON parse failed.');
    } else if (exception === 'timeout') {
      alert('Time out error.');
    } else if (exception === 'abort') {
      alert('Ajax request aborted.');
    } else {
      alert('Uncaught Error.\n' + jqXHR.responseText);
    }
  };

  /* Tweet creation */
  const createTweetElement = function createTweetElementFromTweetsDatabase(tweet) {

    /* header section */
    let $header = $('<header></header>');
    let $avatar = $('<img>').addClass('avatar').attr({
      src: tweet.user.avatars.small,
      alt: 'profile picture',
    });
    let $name = $('<h1></h1>').addClass('name').text(tweet.user.name);
    let $handle = $('<h2></h2>').addClass('handle').text(tweet.user.handle);
    $header.append($avatar, $name, $handle).addClass('tweet-header');

    /* body section */
    let $tweetBody = $('<section></section>').addClass('tweet-body');
    let $tweetText = $('<p></p>').addClass('tweet-text').text(tweet.content.text);
    $tweetBody.append($tweetText);

    /* footer section */
    let $footer = $('<footer></footer>').addClass('tweet-footer');
    let $date = $('<p></p>').addClass('tweet-date').text(timeSince(tweet.created_at));

    /* footer likes container */
    let $likesContainer = $('<div></div>').addClass('tweet-likes-container').attr({
      id: `likes-counter-container-${tweet._id}`,
    });
    let $likes = $('<p></p>').addClass('tweet-likes').text(tweet.likes_count).attr({
      id: `likes-counter-${tweet._id}`,
      'data-likestotal': `${tweet.likes_count}`,
    });
    let $likesSuffix = $('<p></p>').addClass('tweet-likes-suffix').text(showNumberOfTweetLikes(tweet.likes_count)).attr({
      id: `likes-counter-suffix-${tweet._id}`,
    });
    $likesContainer.append($likes, $likesSuffix);

    /* footer icons container */
    let $iconsContainer = $('<div></div>').addClass('icons').attr({
      id: `icons-container-${tweet._id}`,
    });
    let likeUnlikeURL = (tweet, function(url, idx) {
      if ((tweet.likes).indexOf(user) > -1) {
        return `/tweets/${tweet._id}/${user}/unlike`;
      }
      return `/tweets/${tweet._id}/${user}/like`;
    });
    let likeUnlikeTitle = (tweet, function(url, idx) {
      if ((tweet.likes).indexOf(user) > -1) {
        return 'Unlike';
      }
      return 'Like';
    });
    let $heart = $('<button></button>').addClass(`icon ${showUserLikedTweets(tweet, user)}`).attr({
      id: `btn-heart-${tweet._id}`,
      title: likeUnlikeTitle,
      method: 'POST',
      action: likeUnlikeURL,
    });
    let $retweet = $('<span></span>').addClass('icon retweet-tweet').attr('href', 'javascript:void(0);');
    let $flag = $('<span></span>').addClass('icon flag-tweet').attr('href', 'javascript:void(0);');
    $iconsContainer.append($heart, $retweet, $flag);

    $footer.append($date, $likesContainer, $iconsContainer);

    /* entire tweet article */
    let $article = $('<article></article>').addClass('tweet').attr({
      id: `article-${tweet._id}`,
      'data-tweetid': tweet._id,
    });
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
    if ((tweet.likes).indexOf(user) > -1) {
      return 'like-tweet-selected';
    }
    return 'like-tweet-not-selected';
  };

  /* pluralizes number of likes if likes !== 1 */
  const showNumberOfTweetLikes = function showsTotalNumberOfLikesAsCalculatedOnTheServer(count) {
    if (count === 1) {
      return ' like';
    }
    return ' likes';
  };

  /* displays new tweet submission form */
  const composeTweet = function displaysNewTweetSubmissionForm() {
    $('.new-tweet').slideToggle();
    $('.new-tweet textarea').focus();
    $('.new-tweet .counter').text(MAX_TWEET_LENGTH);
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

  /* clears text area */
  const clearTextArea = function clearsTextAreaAndResetsCharacterCounter() {
    $('textarea').val('');
    $('.new-tweet').slideUp();
    $('.new-tweet .counter').text(MAX_TWEET_LENGTH);
  };

  /* async tweet sumbission to database and rendition on same page */
  const submitTweet = function postNewTweet(event) {
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
        error: ajaxErrors,
        success: function() {
          loadTweets('newTweetYes');
          clearTextArea();
        },
      });
    }
  };

  /* Flash message rendition */
  const renderFlashMessage = function invalidTweetDialogBox(message) {
    console.log('renderFlashMessage invoked');
    const dialog = $('.flash');
    dialog.find('p').text(message);
    dialog[0].showModal();
  };

  const closeFlashMessage = function closeFlashMessageWhenUserPressesOK(event) {
    $(this).parent()[0].close();
  };

  /* async loading of rendered tweets on page */
  const loadTweets = function loadTweetsFromDatabase(newTweet) {
    console.log('loadTweets invoked');
    $.ajax({
      url: '/tweets',
      method: 'GET',
      dataType: 'JSON',
      error: ajaxErrors,
      success: function(tweets) {
        if (newTweet === 'newTweetYes') {
          renderTweets([tweets.pop()]);
        } else {
          renderTweets(tweets);
        }
      },
    });
  };

  /* Like validation */
  const validateLike = function checkUserCannotLikeOwnTweet(handle, user) {
    console.log('validateLike invoked');
    let errorMessages = [];
    if (user === handle) {
      errorMessages.push('You can\'t like your own tweet.');
    }
    return errorMessages;
  };

  /* Async tweet sumbission to database and rendition on same page */
  const likeOrUnlikeTweet = function postLikeOrUnlikeToDatabase(event) {
    event.preventDefault();
    console.log('likeOrUnlikeTweet invoked');
    let handle = $(this).closest('article').find('.handle').text();
    let articleDataId = $(this).closest('article').data('tweetid');
    const errorMessages = validateLike(handle, user);
    if (errorMessages.length) {
      renderFlashMessage(errorMessages);
    } else {
      $.ajax({
        url: $(this).closest('button').attr('action'),
        method: $(this).closest('button').attr('method'),
        dataType: 'json',
        error: ajaxErrors,
        success: function(result) {
          toggleHeartColor(event, articleDataId);
          $(`#likes-counter-${articleDataId}`).html(result.value.likes_count);
          $(`#likes-counter-suffix-${articleDataId}`).html(showNumberOfTweetLikes(result.value.likes_count));
        },
      });
    };
  };

  /* Liking a tweet turns heart red and increments likes counter */
  /* Unliking a tweet turns heart back to default color and decrements likes counter */
  const toggleHeartColor = function changesColorOfHeartDependingOnPreviousColorAndUpdatesLikesCounter(event, articleDataId) {
    console.log('toggleHeartColor invoked');
    $(event.target).toggleClass('like-tweet-selected like-tweet-not-selected');
    let heartButtonElement = $('[id^=btn-heart-]');
    if ($(event.target).closest('article').find(heartButtonElement).hasClass('like-tweet-selected')) {
      $(event.target).closest('article').find('.like-tweet-selected').removeAttr('title action').attr({
        title: 'Unlike',
        action: `/tweets/${articleDataId}/${user}/unlike`,
      });
    } else if ($(event.target).closest('article').find(heartButtonElement).hasClass('like-tweet-not-selected')) {
      $(event.target).closest('article').find('.like-tweet-not-selected').removeAttr('title action').attr({
        title: 'Like',
        action: `/tweets/${articleDataId}/${user}/like`,
      });
    }
  };

  /* New tweet is hidden to begin with */
  $('.new-tweet').hide();

  /* Compose button behaviour */
  $('.compose').on('click', composeTweet);

  /* Tweet form submission calls submitTweet function */
  $('#tweet-submission-form').on('submit', submitTweet);

  /* Flash message behaviour in the event of an invalid tweet form */
  $('dialog').on('click', '.close', closeFlashMessage);

  /* Like button behaviour */
  // $('#tweets-container').on('click', '#btn-heart', likeOrUnlikeTweet);
  $('#tweets-container').on('click', '.like-tweet-selected, .like-tweet-not-selected', likeOrUnlikeTweet);

  loadTweets();

});
