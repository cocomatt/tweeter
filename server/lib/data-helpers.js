'use strict';

const ObjectId = require('mongodb').ObjectID;
const bcrypt = require('bcryptjs');

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
        }
        if (!userArray[0]) {
          callback(null, null);
        }
        if (password === userArray[0].password) {
          let user = userArray[0];
          // let loggedInUser = {
          //   _id: userArray[0]._id,
          //   name: userArray[0].name,
          //   handle: userArray[0].handle,
          //   avatars: userArray[0].avatars,
          // };
          // console.log('loggedInUser: ', loggedInUser);
          // callback(null, loggedInUser);
          callback(null, user);
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
