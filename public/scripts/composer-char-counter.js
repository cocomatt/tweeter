'use strict';

$(document).ready(function() {
  $('.new-tweet').on('keyup', 'textarea', function() {
    let charCounter = $(this).parent().find('.counter');
    let tweetLimit = MAX_TWEET_LENGTH;
    let charValue = $(this).val().length;
    if ((tweetLimit - charValue) < 0) {
      charCounter.addClass('counter-red');
      charCounter.text(tweetLimit - charValue);
    } else {
      charCounter.removeClass('counter-red');
      charCounter.text(tweetLimit - charValue);
    }
  });
});
