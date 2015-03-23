'use strict';
/**
 * @file static example
 * @module top-vhost
 * @package top-vhost
 * @subpackage examples
 * @version 0.0.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @license GPLv3
 */

/*
 * initialize module
 */
var vhost = require('..'); // use require('top-vhost') instead
var express = require('express');
var father = express();
var child0 = express();
var child1 = express();
var child2 = express();

// express routing
child0.get('/', function(req, res) {

  res.send('hello 0 /');
}).get('/admin', function(req, res) {

  res.send('hello 0 /admin');
});

child1.get('/', function(req, res) {

  res.send('hello 1 /');
}).get('/admin', function(req, res) {

  res.send('hello 1 /admin');
});

child2.get('/', function(req, res) {

  res.send('hello 2 /');
}).get('/admin', function(req, res) {

  res.send('hello 2 /admin');
});

// server starting
father.use(vhost({
  static: 'static0.json', // read cfg on static0.json every time
  framework: child0
})).use(vhost({
  static: 'static1.json',
})).use(vhost({
  domain: 'http://pippo.com:3000',
  static: 'static2.json',
  framework: child2
})).listen(3000);
console.log('starting server on port 3000');

// child starting
child1.listen(3002);
