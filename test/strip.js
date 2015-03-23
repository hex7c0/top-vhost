'use strict';
/**
 * @file strip test
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
describe('strip', function() {

  var s = 301;

  describe('stripOnlyWWW', function() {

    var father = express();
    father.use(vhost({
      domain: 'http://pippo.com:3000',
      stripOnlyWWW: true,
    })).get('/', function(req, res) {

      res.send('hello father /');
    });

    it('pippo.com/ no redirect', function(done) {

      request(father).get('/').set('Host', 'pippo.com:3000').expect(200, done);
    });
    it('api.pippo.com/ no redirect', function(done) {

      request(father).get('/').set('Host', 'api.pippo.com:3000').expect(200,
        done);
    });
    it('www.pippo.com/', function(done) {

      request(father).get('/').set('Host', 'www.pippo.com:3000').expect(s).end(
        function(err, res) {

          assert.equal(err, null);
          assert.equal(res.header.location, 'http://pippo.com:3000/');
          done();
        });
    });
  });

  describe('stripHTTP', function() {

    var father = express();
    father.use(vhost({
      domain: 'http://pippo.com:3000',
      stripHTTP: true,
    })).get('/', function(req, res) {

      res.send('hello father /');
    });

    it('pippo.com/ https redirect', function(done) {

      request(father).get('/').set('Host', 'pippo.com:3000').expect(s).end(
        function(err, res) {

          assert.equal(err, null);
          assert.equal(res.header.location, 'https://pippo.com:3000/');
          done();
        });
    });
    it('api.pippo.com/ https redirect', function(done) {

      request(father).get('/').set('Host', 'api.pippo.com:3000').expect(s).end(
        function(err, res) {

          assert.equal(err, null);
          assert.equal(res.header.location, 'https://pippo.com:3000/');
          done();
        });
    });
    it('www.pippo.com/ https redirect', function(done) {

      request(father).get('/').set('Host', 'www.pippo.com:3000').expect(s).end(
        function(err, res) {

          assert.equal(err, null);
          assert.equal(res.header.location, 'https://pippo.com:3000/');
          done();
        });
    });
  });

  describe('stripHTTPS', function() {

    var father = express();
    father.use(vhost({
      domain: 'http://pippo.com:3000',
      stripHTTPS: true,
    })).get('/', function(req, res) {

      res.send('hello father /');
    });

    it('pippo.com/ http redirect', function(done) {

      request(father).get('/').set('Host', 'pippo.com:3000').expect(s).end(
        function(err, res) {

          assert.equal(err, null);
          assert.equal(res.header.location, 'http://pippo.com:3000/');
          done();
        });
    });
    it('api.pippo.com/ http redirect', function(done) {

      request(father).get('/').set('Host', 'api.pippo.com:3000').expect(s).end(
        function(err, res) {

          assert.equal(err, null);
          assert.equal(res.header.location, 'http://pippo.com:3000/');
          done();
        });
    });
    it('www.pippo.com/ http redirect', function(done) {

      request(father).get('/').set('Host', 'www.pippo.com:3000').expect(s).end(
        function(err, res) {

          assert.equal(err, null);
          assert.equal(res.header.location, 'http://pippo.com:3000/');
          done();
        });
    });
  });
});
