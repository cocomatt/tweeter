'use strict';

const userHelper = require('../lib/util/user-helper');
const express = require('express');
const ObjectId = require('mongodb').ObjectID;
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const usersRoutes = express.Router();

module.exports = function(DataHelpers) {

  usersRoutes.get('/users', function(req, res) {
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

  usersRoutes.post('/register', function(req, res) {
    if (!req.body) {
      res.status(400).json({
        error: 'invalid request: no data in POST body',
      });
      return;
    }

    const newUser = {
      handle: req.body.newUser.handle,
      name: req.body.newUser.name,
      email: req.body.newUser.email,
      hashed_password: bcrypt.hashSync(req.body.newUser.password, salt),
      avatars: userHelper.generateRandomAvatar(req.body.newUser.handle),
    };

    DataHelpers.register(newUser, (err, registrationStatus) => {
      let emailExists = 'emailExists';
      let handleExists = 'handleExists';
      if (err) {
        req.status(500).json({
          error: err.message,
        });
      } else if (registrationStatus === emailExists) {
        let errorMessages = [];
        errorMessages.push('That email address has already been registered.');
        res.status(200).json({errorMessages: errorMessages});
      } else if (registrationStatus === handleExists) {
        let errorMessages = [];
        errorMessages.push('That user already exists. Please pick another user name.');
        res.status(200).json({errorMessages: errorMessages});
      } else if (registrationStatus === true) {
        req.session.user_id = newUser._id;
        res.status(200).json({newUser: newUser});
      } else {
        res.status(403).send();
      }
    });
  });

  usersRoutes.post('/login', function(req, res) {
    if (!req.body) {
      res.status(400).json({
        error: 'invalid request: no data in POST body',
      });
      return;
    }

    DataHelpers.login(req.body.loginid, req.body.password, (err, validUser) => {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else if (validUser === false) {
        let errorMessages = [];
        errorMessages.push('Please enter a valid username or email address and the right password.');
        res.status(200).json({errorMessages: errorMessages});
      } else if (validUser) {
        req.session.user_id = validUser._id;
        res.status(200).json({validUser: validUser});
      } else {
        res.status(403).send();
      }
    });
  });

  usersRoutes.post('/logout', function(req, res) {
    req.session.user_id = null;
    res.status(200).send();
  });

  return usersRoutes;
};
