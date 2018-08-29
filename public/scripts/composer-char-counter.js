$(document).ready(function() {
  $(".new-tweet").on("keyup", "textarea", function() {
    let counter = $(this).parent().find(".counter");
    let charValue = $(this).val().length;
    if ((140 - charValue) < 0) {
      counter.addClass("counter-red");
      counter.text(140 - charValue);
    } else {
      counter.removeClass("counter-red");
      counter.text(140 - charValue);
    }
  });
});
