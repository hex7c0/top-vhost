'use strict';
/**
 * @file simple example
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
var father = require('express')();

father.use(vhost({
  domain: 'http://pippo.com:3000',
  stripOnlyWWW: true,
}));

// express routing
father.get('/', function(req, res) {

  res.send('hello father /');
}).listen(3000);
console.log('starting server on port 3000');
