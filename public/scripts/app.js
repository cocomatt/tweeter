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

    // header section
    let $header = $('<header></header>');
    let $avatar = $('<img>').addClass('avatar');
    $avatar.attr({
      src: tweet.user.avatars.small,
      alt: 'profile picture',
    });
    let $name = $('<h1></h1>').addClass('name').text(tweet.user.name);
    let $handle = $('<h2></h2>').addClass('handle').text(tweet.user.handle);
    $header.append($avatar, $name, $handle);

    // body section
    let $tweetBody = $('<section></section>').addClass('tweet-body');
    let $tweetText = $('<p></p>').addClass('tweet-text').text(tweet.content.text);
    $tweetBody.append($tweetText);

    // footer section
    let $footer = $('<footer></footer>');
    let $date = $('<p></p>').addClass('tweet-date').text(timeSince(tweet.created_at));
    let $tweetLikesContainer = $('<div></div>').addClass('tweet-likes-container').attr({
      id: 'counter-likes-container',
    });
    let $likes = $('<p></p>').addClass('tweet-likes').text(tweet.likes_count).attr({
      id: 'counter-likes',
      'data-likestotal': tweet.likes_count,
    });
    let $likesSuffix = $('<p></p>').addClass('tweet-likes-suffix').text(showNumberOfTweetLikes(tweet.likes_count)).attr({
      id: 'counter-likes-suffix',
    });
    $tweetLikesContainer.append($likes, $likesSuffix);
    let $icons = $('<div></div>').addClass('icons');
    let likeUnlikeURL = (tweet, function(url, idx) {
      if ((tweet.likes).indexOf(user) > -1) {
        return `/tweets/${tweet._id}/${user}/unlike`;
      }
      return `/tweets/${tweet._id}/${user}/like`;
    });
    let $heart = $('<button></button>').addClass(`icon ${showUserLikedTweets(tweet, user)}`).attr({
      id: 'btn-heart',
      title: 'Like',
      method: 'POST',
      action: likeUnlikeURL,
    });
    let $retweet = $('<span></span>').addClass('icon retweet-tweet').attr('href', 'javascript:void(0);');
    let $flag = $('<span></span>').addClass('icon flag-tweet').attr('href', 'javascript:void(0);');
    $icons.append($heart);
    $icons.append($retweet);
    $icons.append($flag);
    $footer.append($date, $tweetLikesContainer, $icons); // $likes,

    // entire tweet article
    let $article = $('<article></article>').addClass('tweet');
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
    if ((tweet.likes).indexOf(user) > -1) {
      return 'like-tweet-selected';
    }
    return 'like-tweet-deselected';
  };

  /* pluralizes like if !== 1 */
  const showNumberOfTweetLikes = function showsTotalNumberOfLikesAsCalculatedOnTheServer(count) {
    if (count === 1) {
      return ' like';
    }
    return ' likes';
  };

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
      console.log('form: ', form);
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

  const closeFlashMessage = function closeFlashMessageWhenUserPressesOK(event) {
    $(this).parent()[0].close();
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
          console.log(tweets);
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
    const errorMessages = validateLike(handle, user);
    if (errorMessages.length) {
      renderFlashMessage(errorMessages);
    } else {
      $.ajax({
        url: $(this).closest('button').attr('action'),
        method: $(this).closest('button').attr('method'),
        contentType: 'application/json',
        dataType: 'JSON',
        data: {id: $(this).closest('#counter-likes[data-likestotal]').data('likestotal')},
        success: function(data) {
          toggleHeartColor(event, data);
        },
      });
    };
  };

  /* Liking a tweet turns heart red and increments like counter and vice versa */
  const toggleHeartColor = function changesColorOfHeartDependingOnPreviousColor(event, data) {
    console.log('toggleHeartColor invoked');
    $(event.target).toggleClass('like-tweet-selected like-tweet-deselected');
    let totalLikes = $(event.target).closest('article').find('#counter-likes').data('likestotal');
    if ($(event.target).closest('article').find('#btn-heart').hasClass('like-tweet-selected')) {
      totalLikes++;
      // likeaction = 'like';
      $(event.target).closest('article').find('#counter-likes').empty().append(totalLikes);
      $(event.target).closest('article').find('#counter-likes-suffix').empty().append(showNumberOfTweetLikes(totalLikes));
    } else if ($(event.target).closest('article').find('#btn-heart').hasClass('like-tweet-deselected')) {
      totalLikes--;
      // likeaction = 'unlike';
      $(event.target).closest('article').find('#counter-likes').empty().append(totalLikes);
      $(event.target).closest('article').find('#counter-likes-suffix').empty().append(showNumberOfTweetLikes(totalLikes));
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
  $(document).on('click', '#btn-heart', likeOrUnlikeTweet);

  loadTweets();

});
