"use strict";
/**
 * @file top-vhost main
 * @module top-vhost
 * @package top-vhost
 * @subpackage main
 * @version 1.1.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @copyright hex7c0 2014
 * @license GPLv3
 */

/*
 * functions
 */
/**
 * http redirect
 * 
 * @function redirect
 * @param {Object} moved - regex url
 * @param {Object} res - response
 * @param {String} host - req.headers.host
 * @return {Boolean}
 */
function redirect(moved,res,host) {

    var reg = moved.reg;
    for (var i = 0, ii = reg.length; i < ii; i++) {
        if (reg[i].test(host)) {
            try {
                res.redirect(301,moved.orig);
            } catch (TypeError) {
                res.statusCode = 301;
                res.setHeader('location:',moved.orig);
            }
            res.end();
            return true;
        }
    }
    return false;
}
/**
 * regex builder
 * 
 * @function expression
 * @param {String} url - url to be parsed
 * @return {RegExp}
 */
function expression(url) {

    url = url.replace(/http([s]*):\/\//,'');
    if (url[0] != '^') {
        url = '^' + url;
    }
    if (url[url.length - 1] == '$') {
        url = url.slice(0,url.length - 1);
    }
    return new RegExp(url.replace(/\*/g,'([^\.]+)'),'i');
}
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
        domain = expression(domain);
    } else {
        throw new Error('"domain" is required');
    }

    var moved;
    if (Array.isArray(options.redirect) == true) {
        var rdc = redirect;
        moved = options.redirect;
        for (var i = 0, ii = moved.length; i < ii; i++) {
            moved[i] = expression(moved[i]);
        }
        moved = {
            reg: moved,
            orig: options.domain,
        };
    }

    if (options.framework && typeof (options.framework) == 'function') {
        var framework = options.framework;
    } else if (options.proxies && typeof (options.proxies) == 'object') {
        var proxy = require('http-proxy').createProxyServer(options.proxies);
        return function vhost(req,res,next) {

            try {
                var host = req.headers.host;
                if (domain.test(host)) {
                    return proxy.web(req,res);
                } else if (moved && rdc(moved,res,host)) {
                    return;
                }
            } catch (TypeError) {
                // !host
                // pass
            }
            try {
                return next();
            } catch (TypeError) {
                // !next
                return;
            }
        };
    } else {
        throw new Error('"framework" or "proxies" are required');
    }

    return function vhost(req,res,next) {

        try {
            var host = req.headers.host;
            if (domain.test(host)) {
                return framework(req,res,next);
            } else if (moved && rdc(moved,res,host)) {
                return;
            }
        } catch (TypeError) {
            // !host
            // pass
        }
        try {
            return next();
        } catch (TypeError) {
            // !next
            return;
        }
    };
};
