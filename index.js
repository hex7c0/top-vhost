"use strict";
/**
 * @file top-vhost main
 * @module top-vhost
 * @package top-vhost
 * @subpackage main
 * @version 1.0.0
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
    var domain = options.domain;
    if (domain) {
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
    } else {
        throw new Error('"domain" is required');
    }

    if (options.framework) {
        var framework = options.framework;
        if (typeof (framework) != 'function') {
            throw new Error('invalid "framework" argument');
        }
    } else if (options.proxies) {
        var proxy = require('http-proxy').createProxyServer(options.proxies);
        return function vhost(req,res,next) {

            var host = req.headers.host;
            if (host && domain.test(host)) {
                proxy.web(req,res);
            } else {
                next();
            }
        };
    } else {
        throw new Error('"framework" or "proxies" are required');
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
