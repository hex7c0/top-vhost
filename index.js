"use strict";
/**
 * @file top-vhost main
 * @module top-vhost
 * @package top-vhost
 * @subpackage main
 * @version 1.2.0
 * @author hex7c0 <hex7c0@gmail.com>
 * @copyright hex7c0 2014
 * @license GPLv3
 */

/*
 * functions
 */
/**
 * http redirect builder
 * 
 * @function builder
 * @param {Array} moved - url
 * @param {String} domain - req.headers.host
 * @return {Object}
 */
function builder(moved,domain) {

    for (var i = 0, ii = moved.length; i < ii; i++) {
        moved[i] = expression(moved[i]);
    }
    return {
        reg: moved,
        orig: domain,
    };
}
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
 * ending function
 * 
 * @function end
 * @param {Function} next - next op
 * @return
 */
function end(next) {

    try {
        return next();
    } catch (TypeError) {
        // !next
        return;
    }
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
    var rdc = redirect;
    var exp = expression;

    if (options.file) {
        var file = require('path').resolve(options.file);
        var fs = require('fs');
        if (!fs.existsSync(file)) {
            throw new Error('"file" not exists');
        }
        options = null;

        return function vhost(req,res,next) {

            var data = JSON.parse(fs.readFileSync(file,'utf8'));
            for (var i = 0, ii = data.length; i < ii; i++) {
                var d = data[i];
                var domain = exp(d.domain);
                var proxy = require('http-proxy').createProxyServer(d.proxies);
                var moved;
                if (d.redirect) {
                    moved = builder(d.redirect,d.domain);
                }
                var host;
                try {
                    var host = req.headers.host;
                } catch (TypeError) {
                    return end(next);
                }
                if (domain.test(host)) {
                    return proxy.web(req,res);
                } else if (moved && rdc(moved,res,host)) {
                    return;
                }
            }
            return end(next);
        };
    }

    var domain = options.domain;
    if (domain) {
        if (domain.constructor.name == 'RegExp') {
            domain = domain.source;
        } else if (typeof (domain) != 'string') {
            throw new Error('invalid "domain" argument');
        }
        domain = exp(domain);
    } else {
        throw new Error('"domain" is required');
    }

    var moved;
    if (Array.isArray(options.redirect) == true) {
        moved = builder(options.redirect,options.domain);
    }

    if (options.framework && typeof (options.framework) == 'function') {
        var framework = options.framework;
    } else if (options.proxies && typeof (options.proxies) == 'object') {
        var proxy = require('http-proxy').createProxyServer(options.proxies);
        options = null;

        return function vhost(req,res,next) {

            var host;
            try {
                var host = req.headers.host;
            } catch (TypeError) {
                return end(next);
            }
            if (domain.test(host)) {
                return proxy.web(req,res);
            } else if (moved && rdc(moved,res,host)) {
                return;
            }
            return end(next);
        };
    } else {
        throw new Error('"framework" or "proxies" are required');
    }
    options = null;

    return function vhost(req,res,next) {

        var host;
        try {
            var host = req.headers.host;
        } catch (TypeError) {
            return end(next);
        }
        if (domain.test(host)) {
            return framework(req,res,next);
        } else if (moved && rdc(moved,res,host)) {
            return;
        }
        return end(next);
    };
};
