'use strict';
const { router } = require('./router');
const { localStrategy, jwtStrategy, setKnexInstance } = require('./strategies');

module.exports = { router, localStrategy, jwtStrategy, setKnexInstance };
