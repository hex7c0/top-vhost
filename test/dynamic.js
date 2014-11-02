'use strict';
/**
 * @file dynamic test
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
// import
try {
    var vhost = require('..');
    var express = require('express');
    var request = require('supertest');
    var assert = require('assert');
} catch (MODULE_NOT_FOUND) {
    console.error(MODULE_NOT_FOUND);
    process.exit(1);
}

/*
 * test module
 */
describe('dynamic', function() {

    var s = 200;
    var father = express();
    var child0 = express();
    var child1 = express();
    var child2 = express();
    child0.get('/', function(req, res) {

        res.send('hello 0 /');
    });
    child0.listen(3001);
    child1.get('/', function(req, res) {

        res.send('hello 1 /');
    });
    child1.listen(3002);
    child2.get('/', function(req, res) {

        res.send('hello 2 /');
    });
    child2.get('/admin', function(req, res) {

        res.send('hello 2 /admin');
    });
    child2.listen(3003);
    father.use(vhost({
        dynamic: __dirname + '/cfg/dynamic.json'
    }));

    it('api.pippo.com:3000/', function(done) {

        request(father).get('/').set('Host', 'api.pippo.com:3000').expect(s)
                .end(function(err, res) {

                    if (err) {
                        throw err;
                    }
                    assert.equal(res.text, 'hello 0 /');
                    done();
                });
    });
    it('poi.pippo.com:3000/', function(done) {

        request(father).get('/').set('Host', 'poi.pippo.com:3000').expect(s)
                .end(function(err, res) {

                    if (err) {
                        throw err;
                    }
                    assert.equal(res.text, 'hello 1 /');
                    done();
                });
    });
    it('pippo.com:3000/', function(done) {

        request(father).get('/').set('Host', 'pippo.com:3000').expect(s)
                .end(function(err, res) {

                    if (err) {
                        throw err;
                    }
                    assert.equal(res.text, 'hello 2 /');
                    done();
                });
    });
    it('pippo.com:3000/admin', function(done) {

        request(father).get('/admin').set('Host', 'pippo.com:3000').expect(s)
                .end(function(err, res) {

                    if (err) {
                        throw err;
                    }
                    assert.equal(res.text, 'hello 2 /admin');
                    done();
                });
    });
    it('pluto.com:3000/', function(done) {

        request(father).get('/').set('Host', 'pluto.com:3000')
                .expect(301, done);
    });
});
