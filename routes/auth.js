'use strict';

const express = require('express');
const router = express.Router();

router.post('/login', (req, res, next) => {
  res.json({
    isError: false
  });
  return next();
});

module.exports = router;
