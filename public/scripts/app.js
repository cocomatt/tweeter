/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

'use strict';

$(document).ready(function() {

  let USER;
  let USER_ID;
  let NAME;
  let HANDLE;
  let AVATARS;

  const ajaxErrors = function ajaxErrorHandler(jqXHR, exception) {
    if (jqXHR.status === 0) {
      alert('Not connected.\nVerify Network.');
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

  const toggleNavMenu = function openCloseSiteNavMenu() {
    $('.nav-list-items').slideToggle();
  };

  const toggleAbout = function openCloseAboutBox() {
    $('.box-content-about').slideToggle();
    $('.nav-list-items').slideUp();
  };

  const toggleRegister = function openCloseRegisterBox() {
    $('.box-content-register').slideToggle();
    $('.nav-list-items').slideUp();
  };

  const toggleLogin = function openCloseLoginBox() {
    $('.box-content-login').slideToggle();
    $('.nav-list-items').slideUp();
  };

  const closeBox = function closeBoxWhenXClicked(event) {
    $(event.target).closest('[class^=box-content]').slideUp();
  };

  const clearBox = function clearsBoxInputs() {
    $('#login-email-handle').val('');
    $('#login-password').val('');
  };

  const displayAvatarAndComposeButton = function replacesMenuButtonWithUserAvatarAndComposeButton(USER) {
    $('.nav-menu').hide();
    $('.nav-avatar').attr({
      src: AVATARS.small,
      alt: 'user\'s avatar',
    }).show();
    $('.nav-list-item-register').hide();
    $('.nav-list-item-settings').show();
    $('.nav-list-item-login').hide();
    $('.nav-list-item-logout').show();
    $('.compose').show();
  };

  const validateLoginInputs = function checkLoginParamaters(loginid, password) {
    console.log('validateLoginInputs invoked');
    let errorMessages = [];
    if (!loginid || !password) {
      errorMessages.push('Please enter a username, email address and/or your password.');
    }
    return errorMessages;
  };

  /* Login validation */
  const userLogin = function checksLoginCredentials(event) {
    event.preventDefault();
    console.log('userLogin invoked');
    let loginid = $(this).siblings('.required-login-email-handle').children('#login-email-handle').val();
    let password = $(this).siblings('.required-login-password').children('#login-password').val();
    const errorMessages = validateLoginInputs(loginid, password);
    if (errorMessages.length) {
      renderFlashMessage(errorMessages);
    } else {
      $.ajax({
        url: '/login',
        method: 'POST',
        data: {loginid: loginid, password: password},
        dataType: 'json',
        error: ajaxErrors,
        success: function(response) {
          console.log('response: ', response);
          // let USER = response.user;
          USER = response.user;
          USER_ID = response.user._id;
          NAME = response.user.name;
          HANDLE = response.user.handle;
          AVATARS = response.user.avatars;
          console.log('This should be the final USER: ', USER);
          console.log('This should be the final USER_ID: ', USER_ID);
          console.log('This should be the final NAME: ', NAME);
          console.log('This should be the final HANDLE: ', HANDLE);
          console.log('This should be the final AVATARS: ', AVATARS);
          clearBox();
          closeBox(event);
          displayAvatarAndComposeButton(USER);
          $('#tweets-container').empty();
          loadTweets();
        },
      });
    }
  };

  /* displays new tweet submission form */
  const composeTweet = function displaysNewTweetSubmissionForm() {
    $('.new-tweet').slideToggle();
    $('.new-tweet textarea').focus();
    $('.new-tweet .counter').text(MAX_TWEET_LENGTH);
  };

  /* Tweet creation */
  const createTweetElement = function createTweetElementFromTweetsDatabase(tweet) {

    /* header section */
    let $header = $('<header></header>');
    let $avatar = $('<img>').addClass('avatar').attr({
      src: tweet.user.avatars.small,
      alt: 'poster\'s avatar',
    });
    let $name = $('<h1></h1>').addClass('name').text(tweet.user.name);
    let $handle = $('<h2></h2>').addClass('handle').text(`@${tweet.user.handle}`);
    $header.append($avatar, $name, $handle).addClass('tweet-header');

    /* body section */
    let $tweetBody = $('<section></section>').addClass('tweet-body');
    let $tweetText = $('<div></div>').addClass('tweet-text').text(tweet.content.text);
    $tweetBody.append($tweetText);

    /* footer section */
    let $footer = $('<footer></footer>').addClass('tweet-footer');
    let $date = $('<span></span>').addClass('tweet-date').text(timeSince(tweet.created_at));

    /* footer likes container */
    let $likesContainer = $('<span></span>').addClass('tweet-likes-container').attr({
      id: `likes-counter-container-${tweet._id}`,
    });
    let $likes = $('<span></span>').addClass('tweet-likes').text(tweet.likes_count).attr({
      id: `likes-counter-${tweet._id}`,
      'data-likestotal': `${tweet.likes_count}`,
    });
    let $likesSuffix = $('<span></span>').addClass('tweet-likes-suffix').text(showNumberOfTweetLikes(tweet.likes_count)).attr({
      id: `likes-counter-suffix-${tweet._id}`,
    });
    $likesContainer.append($likes, $likesSuffix);

    /* footer icons container */
    let $iconsContainer = $('<span></span>').addClass('icons-container').attr({
      id: `icons-container-${tweet._id}`,
    });
    let likeUnlikeURL = (tweet, function(url, idx) {
      if ((tweet.likes).indexOf(HANDLE) > -1) {
        return `/tweets/${tweet._id}/${HANDLE}/unlike`;
      }
      return `/tweets/${tweet._id}/${HANDLE}/like`;
    });
    let likeUnlikeTitle = (tweet, function(url, idx) {
      if ((tweet.likes).indexOf(HANDLE) > -1) {
        return 'Unlike';
      }
      return 'Like';
    });
    if (!HANDLE) {
      let $heart = $('<button></button>').addClass('icon like-tweet-not-selected');
    }
    let $heart = $('<button></button>').addClass(`icon ${showUserLikedTweets(tweet, HANDLE)}`).attr({
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
      console.log(tweet);
      $('#tweets-container').prepend(createTweetElement(tweet));
    });
  };

  /* makes heart red if user likes tweet */
  const showUserLikedTweets = function makeHeartRedIfUserLikesTweet(tweet, user) {
    if ((!HANDLE) || ((tweet.likes).indexOf(HANDLE) > -1)) {
      console.log('if !HANDLE or HANDLE not in likes array -- HANDLE: false');
      console.log('if !HANDLE or HANDLE not in likes array -- tweet.user.handle: ', tweet.user.handle);
      console.log('user does not like tweet');
      return 'like-tweet-not-selected';
    } else if ((tweet.likes).indexOf(HANDLE) > -1) {
      console.log('if HANDLE or HANDLE is in likes array -- HANDLE: true');
      console.log('if HANDLE or HANDLE is in likes array -- tweet.user.handle: ', tweet.user.handle);
      console.log('user likes tweet');
      return 'like-tweet-selected';
    }
    // return 'like-tweet-not-selected';
  };

  /* pluralizes number of likes if likes !== 1 */
  const showNumberOfTweetLikes = function showsTotalNumberOfLikesAsCalculatedOnTheServer(count) {
    if (count === 1) {
      return ' like';
    }
    return ' likes';
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
    console.log('submitTweet, user =', USER);
    event.preventDefault();
    const errorMessages = validateTweet($(this).find('textarea').val());
    if (errorMessages.length) {
      renderFlashMessage(errorMessages);
    } else {
      let tweetSubmission = {
        user_id: USER_ID,
        name: NAME,
        handle: HANDLE,
        avatars: AVATARS,
        content: $(this).find('textarea').val(),
      };
      console.log('tweetSubmission', tweetSubmission);
      $.ajax({
        method: 'POST',
        url: $(this).attr('action'),
        data: tweetSubmission,
        error: ajaxErrors,
        success: function() {
          console.log('on success of submit tweet, user = ', USER);
          loadTweets('newTweetYes');
          clearTextArea();
        },
      });
    }
  };

  /* Flash message rendition */
  const renderFlashMessage = function FlashMessageDialogBox(message) {
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
  const validateLike = function checkUserCannotLikeOwnTweet(handle, HANDLE) {
    console.log('validateLike invoked');
    let errorMessages = [];
    if (HANDLE === handle) {
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
    const errorMessages = validateLike(handle, HANDLE);
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
        action: `/tweets/${articleDataId}/${handle}/unlike`,
      });
    } else if ($(event.target).closest('article').find(heartButtonElement).hasClass('like-tweet-not-selected')) {
      $(event.target).closest('article').find('.like-tweet-not-selected').removeAttr('title action').attr({
        title: 'Like',
        action: `/tweets/${articleDataId}/${handle}/like`,
      });
    }
  };

  /* New tweet is hidden to begin with */
  $('.new-tweet').hide();

  /* Navigation menu behaviour */
  $('.compose').hide();
  $('.nav-list-items').hide();
  $('.nav-avatar').hide();
  $('.nav-list-item-settings').hide();
  $('.nav-list-item-logout').hide();
  $('.nav-menu').on('click', toggleNavMenu);
  $('.nav-avatar').on('click', toggleNavMenu);

  $('.nav-list-item-about').on('click', toggleAbout);
  $('.nav-list-item-register').on('click', toggleRegister);
  $('.nav-list-item-login').on('click', toggleLogin);

  $('.close-box').on('click', closeBox);

  $('#login').on('click', userLogin);

  /* Compose button behaviour */
  $('.compose').on('click', composeTweet);

  /* Tweet form submission calls submitTweet function */
  $('#tweet-submission-form').on('submit', submitTweet);

  /* Flash message behaviour in the event of an invalid tweet form */
  $('dialog').on('click', '.closeFlashBTN', closeFlashMessage);

  /* Like button behaviour */
  $('#tweets-container').on('click', '.like-tweet-selected, .like-tweet-not-selected', likeOrUnlikeTweet);

  loadTweets();

});
