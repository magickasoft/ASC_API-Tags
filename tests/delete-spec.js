/* eslint-env jasmine */

'use strict';

var config = {
  SRV_NAME: 'tags'
};

var route = require('../routes/delete')(config);

// loading dependencies
var mongoose = require('mongoose');
// mongoose.set('debug', true);
var mockgoose = require('mockgoose');
var run = require('./lib/express-unit').run;
var setup = require('./lib/express-unit-default-setup');
var util = require('util');


// loading mocked data
var newTags = require('./data/data.json');

describe('tags-ms delete handler', function() {
  var createdTags;

  beforeEach(function(done) {
    mockgoose(mongoose).then(function() {
      mongoose.connect('mongodb://example.com/TestingDB', function(err) {
        // Load model
        require('../models/tags')(config).then(function() {
          // Create some data
          mongoose.model('Tag').create(newTags, function(err, results) {
            createdTags = results;
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

  it('should remove a tag', function(done) {

    var args = {
      params: {
        id: createdTags[0]._id.toString()
      }
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalled();

      var tag = res.json.mostRecentCall.args[0];
      expect(util.isArray(tag)).toBe(false);
      expect(tag.status).toBe(204);

      // check the database
      mongoose.model('Tag').findById(args.params.id)
        .lean().exec(function(_err, dbResults) {
          expect(_err).toBeNull();
          expect(dbResults).toBeNull();

          // check if the other data are still there
          mongoose.model('Tag').find({_id: createdTags[1]._id.toString()})
            .lean().exec(function(__err, _dbResults) {
              expect(__err).toBeNull();
              expect(_dbResults.length).toEqual(1);
              done();
            });
        });
    });
  });

  it('should not remove a not owned tag', function(done) {

    var args = {
      params: {
        id: createdTags[0]._id.toString()
      },
      filterOwner: {
        _id: createdTags[1]._id.toString()
      }
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalled();

      var tag = res.json.mostRecentCall.args[0];
      expect(util.isArray(tag)).toBe(false);
      expect(tag.status).toBe(204);

      // check the database
      mongoose.model('Tag').findById(args.params.id)
        .lean().exec(function(_err, dbResults) {
          expect(_err).toBeNull();
          expect(dbResults).toBeDefined();

          // check if the other data are still there
          mongoose.model('Tag').find({_id: createdTags[1]._id.toString()})
            .lean().exec(function(__err, _dbResults) {
              expect(__err).toBeNull();
              expect(_dbResults.length).toEqual(1);
              done();
            });
        });
    });
  });

});
