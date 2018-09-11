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
    // updateLikes: function(tweet, likes, callback) {
    //   db.collection('tweets').findOne({ _id: (tweet._id), likes: (tweet.likes) }).toArray(callback);
    // },
  };
};
