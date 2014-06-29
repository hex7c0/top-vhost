"use strict";
/**
 * @file redirect example
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
    var vhost = require('../index.js'); // use require('top-vhost') instead
    var express = require('express');
    var father = express();
    var child0 = express();
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

// server starting
father.use(vhost({
    domain: 'http://pippo.com:3000',
    framework: child0,
    redirect: ['http://*.pippo.com','http://pluto.com']
}));
father.listen(3000);
console.log('starting server on port 3000');
