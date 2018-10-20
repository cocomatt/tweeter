'use strict';

const ObjectId = require('mongodb').ObjectID;
const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);

// Defines helper functions for saving and getting tweets,
// using the database `db`
module.exports = function makeDataHelpers(db) {
  return {

    // users
    getUsers: function(callback) {
      db.collection('users').find().sort({ created_at: 1 }).toArray((err, users) => {
        if (err) {
          return callback(err);
        }
        callback(null, users);
      });
    },

    // login
    login: function(loginid, password, callback) {
      db.collection('users').find({ $or: [ { handle: loginid }, { email: loginid } ] }).toArray((err, userArray) => {
        if (err) {
          callback(err, null);
        } else if (!userArray[0]) {
          callback(null, false);
        } else if (bcrypt.compareSync(password, userArray[0].hashed_password)) {
          callback(null, userArray[0]);
        } else {
          callback(null, null);
        }
      });
    },

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
        db.collection('tweets').findOneAndUpdate(
          { _id: ObjectId(tweetId) },
          { $inc: { likes_count: 1 }, $push: { likes: user } },
          { returnOriginal: false },
          (err, res) => {
            if (err) {
              return callback(err);
            }
            console.log('updateTweetLikesPushorPullUserHandle inc: ', res);
            callback(null, res);
          });
      } else if (likeaction === 'unlike') {
        db.collection('tweets').findOneAndUpdate(
          { _id: ObjectId(tweetId) },
          { $inc: { likes_count: -1 }, $pull: { likes: user } },
          { returnOriginal: false },
          (err, res) => {
            if (err) {
              return callback(err);
            }
            console.log('updateTweetLikesPushorPullUserHandle dec: ', res);
            callback(null, res);
          }
        );
      }
    },
  };
};
