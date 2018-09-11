'use strict';

// individual tweet object
const ObjectId = require('mongodb').ObjectID;

// Defines helper functions for saving and getting tweets,
// using the database `db`
module.exports = function makeDataHelpers(db) {
  return {

    // Saves a tweet to `db`
    saveTweet: function(newTweet, callback) {
      db.collection('tweets').insertOne(newTweet);
      callback(null, true);
    },

    // Get all tweets in `db`, sorted by newest first
    getTweets: function(callback) {
      db.collection('tweets').find().sort({ created_at: 1 }).toArray(callback);
    },

    // Updates likes array for an individual tweet in `db`
    updateLikes: function(tweetId, user, callback) {
      db.collection('tweets').findOne({ _id: ObjectId(tweetId)}, function(err, result) {
        if (err) {
          callback(err, null);
        }
        let index = result.likes.indexOf(user);
        if (index > -1) {
          result.likes.push(user);
          callback(null, true);
        } else {
          result.likes.splice(index, 1);
          callback(null, false);
        }
      });
    },
  };
};
