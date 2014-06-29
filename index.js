"use strict";
/**
 * @file top-vhost main
 * @module top-vhost
 * @package top-vhost
 * @subpackage main
 * @version 0.0.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @copyright hex7c0 2014
 * @license GPLv3
 */

/*
 * functions
 */
/**
 * main
 * 
 * @function vhost
 * @export vhost
 * @param {Object} options - various options. Check README.md
 * @return {Function}
 */
module.exports = function vhost(options) {

    var options = options || {};
    var domain, framework, port;
    if (options.domain && options.framework) {
        // domain
        domain = options.domain;
        if (domain.constructor.name == 'RegExp') {
            domain = domain.source;
        } else if (typeof (domain) != 'string') {
            throw new Error('invalid "domain" argument');
        }
        if (domain[0] != '^') {
            domain = '^' + domain;
        }
        if (domain[domain.length - 1] == '$') {
            domain = domain.slice(0,domain.length - 1);
        }
        domain = new RegExp(domain.replace(/\*/g,'([^\.]+)'),'i');
        // framework
        framework = options.framework;
        if (typeof (framework) != 'function') {
            throw new Error('invalid "framework" argument');
        }
        // port
        port = parseInt(options.port);
    }

    return function vhost(req,res,next) {

        var host = req.headers.host;
        if (host && domain.test(host)) {
            framework(req,res,next);
        } else {
            next();
        }
    };
};
