/* eslint-env jasmine */

'use strict';

var config = {
  SRV_NAME: 'tags'
};

var route = require('../routes/post_identities')(config);

// loading dependencies
var mongoose = require('mongoose');
// mongoose.set('debug', true);
var mockgoose = require('mockgoose');
var run = require('./lib/express-unit').run;
var setup = require('./lib/express-unit-default-setup');
var util = require('util');


// loading mocked data
var newtags = require('./data/data.json');

describe('tags-ms post_identities handler', function() {
  var createdtags;

  beforeEach(function(done) {
    mockgoose(mongoose).then(function() {
      mongoose.connect('mongodb://example.com/TestingDB', function(err) {
        // Load model
        require('../models/tags')(config).then(function() {
          // Create some data
          mongoose.model('Tag').create(newtags, function(err, results) {
            createdtags = results;
            done(err);
          });
        });
      });
    });
  });

  afterEach(function(done) {
    mockgoose.reset(function() {
      mongoose.disconnect(function() {
        mongoose.unmock(function() {
          delete mongoose.models.Tag;
          done();
        });
      });
    });
  });

  it('should add an identity to a tag', function(done) {

    var identity = {
      identityID: 'a00000000000000000000001'
    };

    var args = {
      params: {
        name: createdtags[0].name
      },
      body: identity
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalled();

      // check the database
      mongoose.model('Tag').findById(createdtags[0]._id.toString())
        .lean().exec(function(_err, tag) {
          expect(_err).toBeNull();
          expect(tag).toBeDefined();
          expect(tag.identities.length).toEqual(1);

          done();
        });
    });
  });

  it('should not insert a not owned identity', function(done) {

    var identity = {
      identityID: 'a00000000000000000000001'
    };

    var args = {
      params: {
        name: createdtags[0].name
      },
      body: identity,
      identity: {
        _id: 'b00000000000000000000002',
        roles: ['users']
      }
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalled();

      // check the database
      mongoose.model('Tag').findById(createdtags[0]._id.toString())
        .lean().exec(function(_err, tag) {
          expect(_err).toBeNull();
          expect(tag).toBeDefined();
          expect(tag.identities.length).toEqual(0);

          done();
        });
    });
  });

  it('should allow an admin to insert a not owned identity', function(done) {

    var identity = {
      identityID: 'a00000000000000000000001'
    };

    var args = {
      params: {
        name: createdtags[0].name
      },
      body: identity,
      identity: {
        _id: 'b00000000000000000000002',
        roles: ['admins']
      }
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalled();

      // check the database
      mongoose.model('Tag').findById(createdtags[0]._id.toString())
        .lean().exec(function(_err, tag) {
          expect(_err).toBeNull();
          expect(tag).toBeDefined();
          expect(tag.identities.length).toEqual(1);

          done();
        });
    });
  });

  it('should return error when identity is empty', function(done) {

    var identity = {
      identityID: ''
    };

    var args = {
      params: {
        name: createdtags[0].name
      },
      body: identity
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();

      // check the database
      mongoose.model('Tag').findById(createdtags[0]._id.toString())
        .lean().exec(function(_err, tag) {
          expect(_err).toBeNull();
          expect(tag).toBeDefined();
          expect(tag.identities.length).toEqual(0);

          done();
        });
    });
  });

});
