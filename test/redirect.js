'use strict';
/**
 * @file redirect test
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
describe('redirect', function() {

    var child0 = express();
    child0.get('/', function(req, res) {

        res.send('hello 0 /');
    });
    child0.get('/admin', function(req, res) {

        res.send('hello 0 /admin');
    });

    describe('301', function() {

        var s = 301;
        var father = express();
        father.use(vhost({
            domain: 'http://pippo.com:3000',
            framework: child0,
            redirect: [ 'http://*.pippo.com', 'http://pluto.com' ]
        }));

        it('pippo.com/ no redirect', function(done) {

            request(father).get('/').set('Host', 'pippo.com:3000')
                    .expect(200, done);
        });
        it('api.pippo.com/', function(done) {

            request(father)
                    .get('/')
                    .set('Host', 'api.pippo.com:3000')
                    .expect(s)
                    .end(function(err, res) {

                        if (err) {
                            throw err;
                        }
                        assert
                                .equal(res.header.location, 'http://pippo.com:3000/');
                        done();
                    });
        });
        it('pluto.com/', function(done) {

            request(father)
                    .get('/')
                    .set('Host', 'pluto.com:3000')
                    .expect(s)
                    .end(function(err, res) {

                        if (err) {
                            throw err;
                        }
                        assert
                                .equal(res.header.location, 'http://pippo.com:3000/');
                        done();
                    });
        });
        it('pluto.com/admin', function(done) {

            request(father)
                    .get('/')
                    .set('Host', 'pluto.com:3000')
                    .expect(s)
                    .end(function(err, res) {

                        if (err) {
                            throw err;
                        }
                        assert
                                .equal(res.header.location, 'http://pippo.com:3000/');
                        done();
                    });
        });
    });

    describe('307', function() {

        var s = 307;
        var father = express();
        father.use(vhost({
            domain: 'http://pippo.com:3000',
            framework: child0,
            redirect: [ 'http://*.pippo.com', 'http://pluto.com' ],
            redirectStatus: 307
        }));

        it('pippo.com/ no redirect', function(done) {

            request(father).get('/').set('Host', 'pippo.com:3000')
                    .expect(200, done);
        });
        it('api.pippo.com/', function(done) {

            request(father)
                    .get('/')
                    .set('Host', 'api.pippo.com:3000')
                    .expect(s)
                    .end(function(err, res) {

                        if (err) {
                            throw err;
                        }
                        assert
                                .equal(res.header.location, 'http://pippo.com:3000/');
                        done();
                    });
        });
        it('pluto.com/', function(done) {

            request(father)
                    .get('/')
                    .set('Host', 'pluto.com:3000')
                    .expect(s)
                    .end(function(err, res) {

                        if (err) {
                            throw err;
                        }
                        assert
                                .equal(res.header.location, 'http://pippo.com:3000/');
                        done();
                    });
        });
        it('pluto.com/admin', function(done) {

            request(father)
                    .get('/')
                    .set('Host', 'pluto.com:3000')
                    .expect(s)
                    .end(function(err, res) {

                        if (err) {
                            throw err;
                        }
                        assert
                                .equal(res.header.location, 'http://pippo.com:3000/');
                        done();
                    });
        });
    });
});
