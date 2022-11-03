'use strict';

const express = require('express');
const app = express();
const auth = require('./routes/auth');
const preferences = require('./config/preferences');
const port = preferences.port;

app.use('/', auth);

app.get('/', (req, res) => {
  res.json({
    hello: 'daydule'
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
