/* eslint-env jasmine */

'use strict';

var config = {
  SRV_NAME: 'tags',
  TAG_NAME_LENGTH: 6
};

var route = require('../routes/post')(config);

// loading dependencies
var mongoose = require('mongoose');
// mongoose.set('debug', true);
var mockgoose = require('mockgoose');
var run = require('./lib/express-unit').run;
var setup = require('./lib/express-unit-default-setup');
var util = require('util');
var async = require('async');

// loading mocked data
var newTags = require('./data/data.json');

describe('tags-ms post handler', function() {

  beforeEach(function(done) {
    mockgoose(mongoose).then(function() {
      mongoose.connect('mongodb://example.com/TestingDB', function(err) {
        require('../models/tags')(config).then(done).catch(done);
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

  it('should create a new tag with a given name', function(done) {

    var args = {
      body: newTags[0]
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      expect(res.location).toHaveBeenCalled();

      var tag = res.json.mostRecentCall.args[0];
      expect(tag.name).toEqual(newTags[0].name);
      expect(tag.ownerID.toString()).toEqual(newTags[0].ownerID);
      done();
    });
  });

  it('should create multiple tags', function(done) {

    async.map(newTags, function(newTag, cb) {
      var args = {
        body: newTag
      };

      run(setup(args), route, function(err, req, res) {
        expect(err).toBeNull();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalled();
        expect(res.location).toHaveBeenCalled();

        var tag = res.json.mostRecentCall.args[0];
        expect(tag.name).toEqual(newTag.name);
        cb(null, tag);
      });
    }, function(err, results) {
      expect(err).toBeNull();
      expect(results.length).toEqual(newTags.length);
      var tag = results[1];
      expect(tag.name).toEqual(newTags[1].name);
      done(err);
    });
  });

  it('should not create two tags with the same name', function(done) {
    var tagTwins = [{
      'name': 'duplicated',
      'ownerID': '000000000000000000000001'
    }, {
      'name': 'duplicated',
      'ownerID': '000000000000000000000001'
    }];

    async.mapSeries(tagTwins, function(newTag, cb) {
      var args = {
        body: newTag
      };

      run(setup(args), route, function(err, req, res) {
        var status = res.status.mostRecentCall.args[0];
        if (status !== 201) { // this is an error
          return cb(res.json.mostRecentCall.args[0]);
        }
        return cb(null, res.json.mostRecentCall.args[0]);
      });
    }, function(err, results) {
      expect(err).toBeDefined();
      var tags = results.filter(function(res) {
        return res;
      });
      expect(tags.length).toEqual(1);

      // check the database
      mongoose.model('Tag').find({
        publicEmail: tagTwins[0].publicEmail
      }).lean().exec(function(_err, dbResults) {
        expect(dbResults.length).toEqual(1);
        done();
      });

    });
  });

  it('should create a new tag with an autogenerated name', function(done) {

    var args = {
      body: {
        'name': '',
        'ownerID': '000000000000000000000001'
      }
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      expect(res.location).toHaveBeenCalled();

      var tag = res.json.mostRecentCall.args[0];
      expect(tag.name).toBeDefined();
      expect(tag.ownerID.toString()).toEqual(newTags[0].ownerID);
      done();
    });
  });

  it('should not accept request with no data', function(done) {

    var args = {
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      expect(res.location).not.toHaveBeenCalled();

      // check the database
      mongoose.model('Tag').find({
      }).lean().exec(function(_err, dbResults) {
        expect(dbResults.length).toEqual(0);
        done();
      });
    });
  });

  it('should not create a new tag without an owner', function(done) {

    var args = {
      body: {
        'name': 'tagname',
        'ownerID': ''
      }
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      expect(res.location).not.toHaveBeenCalled();

      // check the database
      mongoose.model('Tag').find({
        name: args.body.name
      }).lean().exec(function(_err, dbResults) {
        expect(dbResults.length).toEqual(0);
        done();
      });
    });
  });

  it('should autopopulate the owner key from the filterOwner if empty', function(done) {

    var args = {
      body: {
        name: newTags[0].name
      },
      filterOwner: {
        ownerID: newTags[0].ownerID
      }
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      expect(res.location).toHaveBeenCalled();

      var tag = res.json.mostRecentCall.args[0];
      expect(tag.name).toEqual(newTags[0].name);
      expect(tag.ownerID.toString()).toEqual(newTags[0].ownerID);
      done();
    });
  });

  it('should not create a tag of a different identity', function(done) {

    var args = {
      body: newTags[0],
      filterOwner: {
        ownerID: newTags[1].ownerID
      }
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalled();
      expect(res.location).not.toHaveBeenCalled();

      // check the database
      mongoose.model('Tag').find({
        ownerID: args.body.ownerID
      }).lean().exec(function(_err, dbResults) {
        expect(dbResults.length).toEqual(0);
        done();
      });
    });
  });


});
