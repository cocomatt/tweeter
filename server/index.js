'use strict';

require('dotenv').config();

const PORT = 8080;
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SECRETKEY],
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}));

const {MongoClient} = require('mongodb');
const MONGODB_URI = 'mongodb://localhost:27017/tweeter';

MongoClient.connect(
  MONGODB_URI, {useNewUrlParser: true},
  (err, client) => {
    const db = client.db('tweeter');
    if (err) {
      console.error(`Failed to connect: ${MONGODB_URI}`);
      throw err;
    }
    console.log(`Connected to mongodb: ${MONGODB_URI}`);
    const DataHelpers = require('./lib/data-helpers.js')(db);
    const tweetsRoutes = require('./routes/tweets')(DataHelpers);
    const usersRoutes = require('./routes/users')(DataHelpers);

    app.use('/tweets', tweetsRoutes);
    app.use('/', usersRoutes);

    app.listen(PORT, () => {
      console.log('Example app listening on port ' + PORT);
    });
  }
);
