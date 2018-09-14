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
      let index = db.tweets.aggregate(
        [
          {$match: { _id: ObjectId(tweetId) }},
          {$project: { index: {$indexOfArray: '$likes' }}},
        ],
        function(err, result) {
          if (err) {}
          console.log(result);
        }
      );
    },
  };
};

// if (index === -1) {
//   db.tweets.update(
//     { _id: ObjectId(tweetId) },
//     { $addToSet: { $likes: user } }
//   );
// } else {
//   db.tweets.update(
//     { _id: ObjectId(tweetId) },
//     { $pull: { $likes: user } }
//   );
// }

//     db.collection('tweets').updateOne({ _id: ObjectId(tweetId) }), function(err, result) {
//     // db.tweets.findOne({ _id: ObjectId(tweetId)}, function(err, result) {
//       if (err) {
//         callback(err, null);
//       }
//       let index = result.likes.indexOf(user);
//       if (index === -1) {
//         db.tweets.update(
//           { _id: ObjectId(tweetId) },
//           { $push: { likes: user } }
//         )
//       } else {
//         db.tweets.update(
//           {  _id: ObjectId(tweetId) },
//           { $pull: { likes: user } }
//         )
//       }
//     },
//   }
// }
// updateLikes: function(tweetId, user, callback) {
//   db.collection('tweets').findOne({ _id: ObjectId(tweetId)}, function(err, result) {
//     if (err) {
//       callback(err, null);
//     }
//     db.collection('tweets').findOne({ _id: ObjectId(tweetId)}, function(err, result) {
//       if (err) {
//         callback(err, null);
//       }
//       // let index = $.inArray(user, result.likes);
//       let index = result.likes.indexOf(user);
//       if (index === -1) {
//         result.likes.push(user);
//         // callback(null, true);
//       } else {
//         result.likes.splice(index, 1);
//         // callback(null, false);
//       }
//       // let index = result.likes.indexOf(user);
//       // if (index === -1) {
//       //   (result.likes).push(user);
//       //   callback(null, true);
//       // } else {
//       //   (result.likes).splice(index, 1);
//       //   callback(null, false);
//       // }
//       db.collection('tweets').updateOne({ _id: ObjectId(tweetId) }, { $set: { likes: result.likes }});
//     });
//   });
// },

// updateLikes: function(tweetId, user, callback) {
//   db.collection('tweets').findOne({ _id: ObjectId(tweetId)}, function(err, result) {
//     if (err) {
//       callback(err, null);
//     }
//     let index = result.likes.indexOf(user);
//     if (index > -1) {
//       result.likes.push(user);
//       callback(null, true);
//     } else {
//       // result.likes.pull(user);
//       result.likes.splice(index, 1);
//       callback(null, false);
//     }
//     db.collection('tweets').updateOne({ _id: ObjectId(tweetId) }, { $set: { likes: result.likes }});
//   });
// },
