'use strict';

const {MongoClient} = require('mongodb');
const ObjectId = require('mongodb').ObjectID;

// Defines helper functions for saving and getting tweets,
// using the database `db`
module.exports = function makeDataHelpers(db) {
  return {
    // Saves a tweet to `db`
    saveTweet: function(newTweet, callback) {
      db.collection('tweets').insertOne(newTweet, (err, res) => {
        if (err) {
          return callback(err);
        }
        callback(null, res);
      });
    },
    // Get all tweets in `db`, sorted by newest first
    getTweets: function(callback) {
      db.collection('tweets').find().sort({ created_at: 1 }).toArray((err, tweets) => {
        if (err) {
          return callback(err);
        }
        callback(null, tweets);
      });
    },

    updateTweetLikesPushorPullUserHandle: function(tweetId, user, likeaction, callback) {
      if (likeaction === 'like') {
        db.collection('tweets').updateOne(
          { _id: ObjectId(tweetId) },
          { $inc: { likes_count: 1 }, $push: { likes: user } },
          (err, res) => {
            if (err) {
              return callback(err);
            }
            callback(null, res);
          });
      } else if (likeaction === 'unlike') {
        db.collection('tweets').updateOne(
          { _id: ObjectId(tweetId) },
          { $inc: { likes_count: -1 }, $pull: { likes: user } },
          (err, res) => {
            if (err) {
              return callback(err);
            }
            callback(null, res);
          });
      }
    },
  };
};
