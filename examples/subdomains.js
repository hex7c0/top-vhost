'use strict';
/**
 * @file subdomain example
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
// import
try {
    var vhost = require('../index.min.js'); // use require('top-vhost') instead
    var express = require('express');
    var father = express();
    var child0 = express();
    var child1 = express();
    var child2 = express();
} catch (MODULE_NOT_FOUND) {
    console.error(MODULE_NOT_FOUND);
    process.exit(1);
}

// express routing
child0.get('/',function(req,res) {

    res.send('hello 0 /');
});
child0.get('/admin',function(req,res) {

    res.send('hello 0 /admin');
});

child1.get('/',function(req,res) {

    res.send('hello 1 /');
});
child1.get('/admin',function(req,res) {

    res.send('hello 1 /admin');
});

child2.get('/',function(req,res) {

    res.send('hello 2 /');
});
child2.get('/admin',function(req,res) {

    res.send('hello 2 /admin');
});

// server starting
father.use(vhost({
    domain: 'http://api.pippo.com:3000',
    framework: child0
}));
father.use(vhost({
    domain: 'http://*.pippo.com:3000',
    framework: child1
}));
father.use(vhost({
    domain: 'http://pippo.com:3000',
    framework: child2
}));
father.listen(3000);
console.log('starting server on port 3000');
