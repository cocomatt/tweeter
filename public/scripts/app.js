/*
 * Client-side JS logic goes here
 */

'use strict';

$(document).ready(function() {

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

  const toggleNavMenu = function openCloseSiteNavMenu(event) {
    event.stopPropagation();
    $('.nav-list-items').slideToggle();
    if ($('[class^=box-content]')) {
      $('[class^=box-content]').slideUp();
    }
  };

  const hideNavMenu = function closesNavMenuWhenUserClicksElsewhereInTheDocument() {
    $('.nav-list-items').slideUp();
  };

  const toggleAbout = function openCloseAboutBox() {
    window.scrollTo(0, 0);
    $('.box-content-about').slideToggle();
    $('.nav-list-items').slideUp();
  };

  const toggleRegister = function openCloseRegisterBox() {
    window.scrollTo(0, 0);
    $('.box-content-register').slideToggle();
    $('.nav-list-items').slideUp();
  };

  const toggleLogin = function openCloseLoginBox() {
    window.scrollTo(0, 0);
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

  const displayAvatarAndComposeButton = function replacesMenuButtonWithUserAvatarAndComposeButton() {
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

  /* Registration validation */
  const userRegistration = function validatesRegistrationInputs(event) {
    event.preventDefault();
    let email = $(this).siblings('.required-registration-email').children('#register-email').val();
    let handle = $(this).siblings('.required-registration-handle').children('#register-handle').val();
    let name = $(this).siblings('.required-registration-name').children('#register-name').val();
    let password = $(this).siblings('.required-registration-password').children('#register-password').val();
    let passwordConfirmation = $(this).siblings('.required-registration-password-confirmation').children('#register-password-confirmation').val();
    let errorMessages = [];
    if (!email) {
      errorMessages.push('Please enter a valid email address.\n');
    }
    if (!handle) {
      errorMessages.push('Please enter a user name.\n');
    }
    if (!name) {
      errorMessages.push('Please enter your name.\n');
    }
    if (!password) {
      errorMessages.push('Please enter a password.\n');
    }
    if (password && !passwordConfirmation) {
      errorMessages.push('Please re-enter your password.\n');
    }
    if (password !== passwordConfirmation) {
      errorMessages.push('The password you re-entered doesn\'t match\n');
    }
    if (errorMessages.length) {
      renderFlashMessage(errorMessages);
    } else {
      let newUser = {
        email: email,
        handle: handle,
        name: name,
        password: password,
      };
      $.ajax({
        url: '/register',
        method: 'POST',
        data: {newUser: newUser},
        dataType: 'json',
        error: ajaxErrors,
        success: function(response) {
          if (response.errorMessages) {
            let errorMessages = [];
            errorMessages.push(response.errorMessages[0]);
            renderFlashMessage(errorMessages);
          } else {
            HANDLE = response.newUser.handle;
            NAME = response.newUser.name;
            AVATARS = response.newUser.avatars;
            clearBox();
            closeBox(event);
            displayAvatarAndComposeButton();
          }
        },
      });
    }
  };

  /* Login validation */
  const userLogin = function validatesLoginInputs(event) {
    event.preventDefault();
    let loginid = $(this).siblings('.required-login-email-handle').children('#login-email-handle').val();
    let password = $(this).siblings('.required-login-password').children('#login-password').val();
    let errorMessages = [];
    if (!loginid) {
      errorMessages.push('Please enter your username or email address.');
    }
    if (!password) {
      errorMessages.push('You forgot your password.');
    }
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
          if (response.errorMessages) {
            let errorMessages = [];
            errorMessages.push(response.errorMessages[0]);
            renderFlashMessage(errorMessages);
          } else {
            USER_ID = response.validUser._id;
            NAME = response.validUser.name;
            HANDLE = response.validUser.handle;
            AVATARS = response.validUser.avatars;
            clearBox();
            closeBox(event);
            displayAvatarAndComposeButton();
            $('#tweets-container').empty();
            loadTweets();
          }
        },
      });
    }
  };

  const userLogout = function userIsLoggedOut(event) {
    $.ajax({
      url: '/logout',
      method: 'POST',
      success: function() {
        $('.compose').hide();
        $('.nav-avatar').hide();
        $('.nav-menu').show();
        $('.nav-list-items').slideUp();
        $('.nav-list-item-register').show();
        $('.nav-list-item-settings').hide();
        $('.nav-list-item-login').show();
        $('.nav-list-item-logout').hide();
        $('.new-tweet').hide();
        USER_ID = null;
        NAME = null;
        HANDLE = null;
        AVATARS = null;
      },
    });
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
    let $flag = $('<span></span>').addClass('icon flag-tweet').attr('href', 'javascript:void(0);');
    let $retweet = $('<span></span>').addClass('icon retweet-tweet').attr('href', 'javascript:void(0);');
    if (!HANDLE) {
      let $heart = $('<button></button>').addClass('icon like-tweet-not-selected');
    }
    let $heart = $('<button></button>').addClass(`icon ${showUserLikedTweets(tweet, HANDLE)}`).attr({
      id: `btn-heart-${tweet._id}`,
      title: likeUnlikeTitle,
      method: 'POST',
      action: likeUnlikeURL,
    });
    $iconsContainer.append($flag, $retweet, $heart);

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
    tweets.forEach(function(tweet) {
      $('#tweets-container').prepend(createTweetElement(tweet));
    });
  };

  /* makes heart red if user likes tweet */
  const showUserLikedTweets = function makeHeartRedIfUserLikesTweet(tweet, user) {
    if ((!HANDLE) || ((tweet.likes).indexOf(HANDLE) === -1)) {
      return 'like-tweet-not-selected';
    } else if ((tweet.likes).indexOf(HANDLE) > -1) {
      return 'like-tweet-selected';
    }
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
      $.ajax({
        method: 'POST',
        url: $(this).attr('action'),
        data: tweetSubmission,
        error: ajaxErrors,
        success: function() {
          loadTweets('newTweetYes');
          clearTextArea();
        },
      });
    }
  };

  /* Flash message rendition */
  const renderFlashMessage = function FlashMessageDialogBox(messages) {
    const dialog = $('.flash');
    if (messages.length) {
      $('.error-messages-container').empty();
      messages.forEach(function(message) {
        let $errorMessage = $('<div></div>').addClass('error-message').html(message + '<br>');
        let $errorMessagesContainer = $('<section></section>').append($errorMessage);
        $('.error-messages-container').append($errorMessage);
      });
      dialog[0].showModal();
    }
  };

  /* Closes flash message */
  const closeFlashMessage = function closeFlashMessageWhenUserPressesOK(event) {
    $(this).parent()[0].close();
  };

  /* async loading of rendered tweets on page */
  const loadTweets = function loadTweetsFromDatabase(newTweet) {
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
    let displayedHANDLE = `@${HANDLE}`;
    let errorMessages = [];
    if (!HANDLE) {
      errorMessages.push('You have to login or register before you can like a tweet.');
    }
    if (displayedHANDLE === handle) {
      errorMessages.push('You can\'t like your own tweet.');
    }
    return errorMessages;
  };

  /* Async tweet sumbission to database and rendition on same page */
  const likeOrUnlikeTweet = function postLikeOrUnlikeToDatabase(event) {
    event.preventDefault();
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
    $(event.target).toggleClass('like-tweet-selected like-tweet-not-selected');
    let heartButtonElement = $('[id^=btn-heart-]');
    if ($(event.target).closest('article').find(heartButtonElement).hasClass('like-tweet-selected')) {
      $(event.target).closest('article').find('.like-tweet-selected').removeAttr('title action').attr({
        title: 'Unlike',
        action: `/tweets/${articleDataId}/${HANDLE}/unlike`,
      });
    } else if ($(event.target).closest('article').find(heartButtonElement).hasClass('like-tweet-not-selected')) {
      $(event.target).closest('article').find('.like-tweet-not-selected').removeAttr('title action').attr({
        title: 'Like',
        action: `/tweets/${articleDataId}/${HANDLE}/like`,
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
  $(document).on('click', hideNavMenu);
  $('.nav-list-item-about').on('click', toggleAbout);
  $('.nav-list-item-register').on('click', toggleRegister);
  $('.nav-list-item-login').on('click', toggleLogin);

  $('.close-box').on('click', closeBox);

  $('#register').on('click', userRegistration);
  $('#login').on('click', userLogin);
  $('.nav-list-item-logout').on('click', userLogout);

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
