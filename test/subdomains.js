'use strict';
/**
 * @file subdomains test
 * @module top-vhost
 * @package top-vhost
 * @subpackage test
 * @version 0.0.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @license GPLv3
 */

/*
 * initialize module
 */
var vhost = require('..');
var express = require('express');
var request = require('supertest');
var assert = require('assert');

/*
 * test module
 */
describe('subdomains', function() {

  var s = 200;
  var father = express();
  var child0 = express();
  var child1 = express();
  var child2 = express();

  before(function(done) {

    child0.get('/', function(req, res) {

      res.send('hello 0 /');
    });
    child1.get('/', function(req, res) {

      res.send('hello 1 /');
    });
    child2.get('/', function(req, res) {

      res.send('hello 2 /');
    }).get('/admin', function(req, res) {

      res.send('hello 2 /admin');
    });
    father.use(vhost({
      domain: 'http://api.pippo.com:3000',
      framework: child0
    })).use(vhost({
      domain: 'http://*.pippo.com:3000',
      framework: child1
    })).use(vhost({
      domain: 'http://pippo.com:3000',
      framework: child2
    }));
    done();
  });

  it('should return api.pippo.com:3000/', function(done) {

    request(father).get('/').set('Host', 'api.pippo.com:3000').expect(s).end(
      function(err, res) {

        assert.ifError(err);
        assert.equal(res.text, 'hello 0 /');
        done();
      });
  });
  it('should return poi.pippo.com:3000/', function(done) {

    request(father).get('/').set('Host', 'poi.pippo.com:3000').expect(s).end(
      function(err, res) {

        assert.ifError(err);
        assert.equal(res.text, 'hello 1 /');
        done();
      });
  });
  it('should return pippo.com:3000/', function(done) {

    request(father).get('/').set('Host', 'pippo.com:3000').expect(s).end(
      function(err, res) {

        assert.ifError(err);
        assert.equal(res.text, 'hello 2 /');
        done();
      });
  });
  it('should return pippo.com:3000/admin', function(done) {

    request(father).get('/admin').set('Host', 'pippo.com:3000').expect(s).end(
      function(err, res) {

        assert.ifError(err);
        assert.equal(res.text, 'hello 2 /admin');
        done();
      });
  });
});
