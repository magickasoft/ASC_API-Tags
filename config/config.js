'use strict';

/*
  this file explicits the default for configuration variables
 */

var config = {

  APP_PORT: process.env.APP_PORT || 3033,
  APP_HOST: process.env.APP_HOST || '0.0.0.0',
  SRV_NAME: process.env.SRV_NAME || 'tags',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_HOST: process.env.MONGODB_HOST || '0.0.0.0',
  JWT_SECRET: process.env.JWT_SECRET || 'ASC-SECRET',
  JWT_DURATION: (process.env.JWT_DURATION || 10 * 24 * 60 * 60) * 1000, //seconds
  TAG_NAME_LENGTH: process.env.TAG_NAME_LENGTH || 6,
  TAG_NAME_RETRIES: process.env.TAG_NAME_RETRIES || 100
};

config.MONGODB_NAME = process.env.MONGODB_NAME || config.SRV_NAME;

if (config.NODE_ENV === 'development' || config.NODE_ENV === 'test') { // development and test specific
  config.DEBUG = process.env.DEBUG = '*'; // forcing debug output
}

exports = module.exports = config;
