'use strict';
/**
 * @file error test
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
var assert = require('assert');

/*
 * test module
 */
describe('error', function() {

  describe('options', function() {

    it('should return required "domain" error', function(done) {

      try {
        vhost();
      } catch (err) {
        assert.equal(err.message, '"domain" is required');
        done();
      }
    });
    it('should return invalid "domain" error', function(done) {

      try {
        vhost({
          domain: 123
        });
      } catch (err) {
        assert.equal(err.message, 'invalid "domain" argument');
        done();
      }
    });
    it('should return invalid type error', function(done) {

      try {
        vhost({
          domain: 'foo'
        });
      } catch (err) {
        assert.equal(err.message, '"framework" or "proxies" are required');
        done();
      }
    });
  });

  describe('static', function() {

    it('should return required "domain" error', function(done) {

      try {
        vhost({
          static: __dirname + '/cfg/static0_err.json'
        });
      } catch (err) {
        assert.equal(err.message, '"domain" is required');
        done();
      }
    });
    it('should return invalid "domain" error', function(done) {

      try {
        vhost({
          static: __dirname + '/cfg/static1_err.json'
        });
      } catch (err) {
        assert.equal(err.message, 'invalid "domain" argument');
        done();
      }
    });
    it('should return invalid type error', function(done) {

      try {
        vhost({
          static: __dirname + '/cfg/static2_err.json'
        });
      } catch (err) {
        assert.equal(err.message, '"framework" or "proxies" are required');
        done();
      }
    });
  });
});
