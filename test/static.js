'use strict';
/**
 * @file static test
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
describe('static', function() {

  var s = 200;
  var father = express();
  var child0 = express();
  var child1 = express();
  var child2 = express();

  child0.get('/', function(req, res) {

    res.send('hello 0 /');
  });
  child1.get('/', function(req, res) {

    res.send('hello 1 /');
  }).listen(3002);
  child2.get('/', function(req, res) {

    res.send('hello 2 /');
  }).get('/admin', function(req, res) {

    res.send('hello 2 /admin');
  });
  father.use(vhost({
    static: __dirname + '/cfg/static0.json',
    framework: child0
  })).use(vhost({
    static: __dirname + '/cfg/static1.json',
  })).use(vhost({
    domain: 'http://pippo.com:3000',
    static: __dirname + '/cfg/static2.json',
    framework: child2
  }));

  it('api.pippo.com:3000/', function(done) {

    request(father).get('/').set('Host', 'api.pippo.com:3000').expect(s).end(
      function(err, res) {

        assert.ifError(err);
        assert.equal(res.text, 'hello 0 /');
        done();
      });
  });
  it('poi.pippo.com:3000/', function(done) {

    request(father).get('/').set('Host', 'poi.pippo.com:3000').expect(s).end(
      function(err, res) {

        assert.ifError(err);
        assert.equal(res.text, 'hello 1 /');
        done();
      });
  });
  it('pippo.com:3000/', function(done) {

    request(father).get('/').set('Host', 'pippo.com:3000').expect(s).end(
      function(err, res) {

        assert.ifError(err);
        assert.equal(res.text, 'hello 2 /');
        done();
      });
  });
  it('pippo.com:3000/admin', function(done) {

    request(father).get('/admin').set('Host', 'pippo.com:3000').expect(s).end(
      function(err, res) {

        assert.ifError(err);
        assert.equal(res.text, 'hello 2 /admin');
        done();
      });
  });
  it('pluto.com:3000/', function(done) {

    request(father).get('/').set('Host', 'pluto.com:3000').expect(301, done);
  });
});
