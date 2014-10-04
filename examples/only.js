'use strict';
/**
 * @file only example
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
} catch (MODULE_NOT_FOUND) {
    console.error(MODULE_NOT_FOUND);
    process.exit(1);
}

father.use(vhost({
    domain: 'http://pippo.com:3000',
    stripOnlyWWW: true,
}));
// express routing
father.get('/',function(req,res) {

    res.send('hello father /');
});
// server starting
father.listen(3000);
console.log('starting server on port 3000');
