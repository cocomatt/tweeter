'use strict';

const numberOfLikes = function getTotalNumberOfLikesOfATweet(likes) {
  if (likes.length === 1) {
    return likes.length + ' like';
  }
  return likes.length + ' likes';
};
