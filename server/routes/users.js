'use strict';

const userHelper = require('../lib/util/user-helper');

const express = require('express');
const usersRoutes = express.Router();

module.exports = function(DataHelpers) {

  usersRoutes.get('/', function(req, res) {
    DataHelpers.getUsers((err, users) => {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        res.status(200).json(users);
      }
    });
  });

  usersRoutes.post('/login', function(req, res) {
    DataHelpers.login(req.body.loginid, req.body.password, (err, user) => {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        if (user) {
          console.log('user: ', user);
          req.session.userId = user._id;
          console.log('req.session.userId: ', req.session.userId);
          res.status(200).json({user: user});
        } else {
          res.status(403).send();
        }
      }
    });
  });

  return usersRoutes;
};
