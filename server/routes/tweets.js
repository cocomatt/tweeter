'use strict';

const userHelper = require('../lib/util/user-helper');

const express = require('express');
const tweetsRoutes = express.Router();

module.exports = function(DataHelpers) {

  tweetsRoutes.get('/', function(req, res) {
    DataHelpers.getTweets((err, tweets) => {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        res.status(200).json(tweets);
      }
    });
  });

  tweetsRoutes.post('/', function(req, res) {
    console.log('req.body:', req.body);
    if (!req.body) {
      res.status(400).json({
        error: 'invalid request: no data in POST body',
      });
      return;
    }

    const tweet = {
      user: {
        user_id: req.body.user_id,
        name: req.body.name,
        handle: req.body.handle,
        avatars: req.body.avatars,
      },
      content: {
        text: req.body.content,
      },
      created_at: Date.now(),
      likes: [],
      likes_count: 0,
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

  tweetsRoutes.post('/:id/:user/:likeaction', function(req, res) {
    DataHelpers.updateTweetLikesPushorPullUserHandle(req.params.id, req.params.user, req.params.likeaction, (err, likes) => {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        res.status(200).json(likes);
      }
    });
  });

  return tweetsRoutes;
};
