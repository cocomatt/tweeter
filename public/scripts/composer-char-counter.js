$(document).ready(function() {
  $(".new-tweet").on("keyup", "textarea", function() {
    let counter = $(this).parent().find(".counter");
    let tweetLimit = MAX_TWEET_LENGTH;
    let charValue = $(this).val().length;
    if ((tweetLimit - charValue) < 0) {
      counter.addClass("counter-red");
      counter.text(tweetLimit - charValue);
    } else {
      counter.removeClass("counter-red");
      counter.text(tweetLimit - charValue);
    }
  });
});
