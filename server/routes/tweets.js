'use strict';

const userHelper = require('../lib/util/user-helper');

const express = require('express');
const tweetsRoutes = express.Router();

// const ObjectId = require('mongodb').ObjectID;

module.exports = function(DataHelpers) {

  tweetsRoutes.get('/', function(req, res) {
    DataHelpers.getTweets((err, tweets) => {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        res.json(tweets);
      }
    });
  });

  tweetsRoutes.post('/', function(req, res) {
    if (!req.body.text) {
      res.status(400).json({
        error: 'invalid request: no data in POST body',
      });
      return;
    }

    const user = req.body.user ? req.body.user : userHelper.generateRandomUser();
    const tweet = {
      user: user,
      content: {
        text: req.body.text,
      },
      created_at: Date.now(),
      likes: [],
    };

    DataHelpers.saveTweet(tweet, (err) => {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        res.status(201).send();
      }
    });
  });

  // tweetsRoutes.get('/:id', function(req, res) {
  //   let tweet = ObjectId(req.params.id);
  //   DataHelpers.getTweet((err, tweet) => {
  //     if (err) {
  //       res.status(500).json({
  //         error: err.message,
  //       });
  //     } else {
  //       res.json(tweet);
  //     }
  //   });
  // });

  tweetsRoutes.post('/:id/:user', function(req, res) {
    DataHelpers.updateLikes(req.params.id, req.params.user, (err, likes) => {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        res.status(201).send();
        return;
      }
    });
  });

  return tweetsRoutes;

};
