'use strict';

const userHelper = require('../lib/util/user-helper');

const express = require('express');
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
    DataHelpers.register(req.body.email, req.body.handle, req.body.name, req.body.password, (err, registrationStatus) => {
      console.log('registrationStatus under /register: ', registrationStatus);
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
      } else if (registrationStatus === false) {
        let user = registrationStatus;
        req.session.user_id = 'newUser';
        console.log('user: ', user);
        req.status(200).json({user: user});
      } else {
        res.status(403).send();
      }
    });
  });

  usersRoutes.post('/login', function(req, res) {
    DataHelpers.login(req.body.loginid, req.body.password, (err, user) => {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else if (user === false) {
        let errorMessages = [];
        errorMessages.push('That user doesn\'t exist. Please enter a valid username or email address. If you haven\'t registered, please do so.');
        res.status(200).json({errorMessages: errorMessages});
      } else if (user) {
        req.session.user_id = user._id;
        res.status(200).json({user: user});
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
