"use strict";
/**
 * @file top-vhost main
 * @module top-vhost
 * @package top-vhost
 * @subpackage main
 * @version 1.3.0
 * @author hex7c0 <hex7c0@gmail.com>
 * @copyright hex7c0 2014
 * @license GPLv3
 */

/*
 * initialize module
 */
var fs = require('fs');

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
 * dynamic file
 * 
 * @function dynamic
 * @param {String} file - input file
 * @return {Function}
 */
function dynamics(file) {

    if (!fs.existsSync(file)) {
        throw new Error('"file" not exists');
    }
    var file = require('path').resolve(file);
    var rdc = redirect, exp = expression;

    return function vhost(req,res,next) {

        // file refresh; instead require(), that use cache
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
                if (domain.test(host)) {
                    return proxy.web(req,res);
                } else if (moved && rdc(moved,res,host)) {
                    return;
                }
            } catch (TypeError) {
                break;
            }
            return end(next);
        };
    };
}
/**
 * statics file
 * 
 * @function statics
 * @param {String} file - input file
 * @param {Object} obj - parsed options
 * @return {Function}
 */
function statics(file,obj) {

    if (!fs.existsSync(file)) {
        throw new Error('"file" not exists');
    }
    var d = require(require('path').resolve(file));
    var domain, moved;

    if (obj.domain) {
        domain = obj.domain;
    } else if (domain = d.domain) {
        if (domain.constructor.name == 'RegExp') {
            domain = domain.source;
        } else if (typeof (domain) != 'string') {
            throw new Error('invalid "domain" argument');
        }
        domain = expression(domain);
    } else {
        throw new Error('"domain" is required');
    }

    if (obj.moved) {
        moved = obj.moved;
    } else if (Array.isArray(d.redirect) == true) {
        moved = builder(d.redirect,d.domain);
    }

    if (obj.framework) {
        return framework(domain,moved,obj.framework);
    } else if (obj.proxies) {
        return proxies(domain,moved,obj.proxies);
    } else if (d.proxies && typeof (d.proxies) == 'object') {
        var proxy = require('http-proxy').createProxyServer(d.proxies);
        return proxies(domain,moved,proxy);
    } else {
        throw new Error('"framework" or "proxies" are required');
    }
}
/**
 * proxy work
 * 
 * @function proxies
 * @param {RegExp} domain - vhost
 * @param {Array} moved - array of 301
 * @param {Object} proxy - proxy
 * @return {Function}
 */
function proxies(domain,moved,proxy) {

    var domain = domain, moved = moved;
    var rdc = redirect, proxy = proxy;

    return function vhost(req,res,next) {

        var host;
        try {
            var host = req.headers.host;
            if (domain.test(host)) {
                return proxy.web(req,res);
            } else if (moved && redirect(moved,res,host)) {
                return;
            }
        } catch (TypeError) {
            // pass
        }
        return end(next);
    };
}
/**
 * framework work
 * 
 * @function framework
 * @param {RegExp} domain - vhost
 * @param {Array} moved - array of 301
 * @param {Object} fs - framework
 * @return {Function}
 */
function framework(domain,moved,fw) {

    var domain = domain, moved = moved;
    var rdc = redirect, fw = fw;

    return function vhost(req,res,next) {

        var host;
        try {
            var host = req.headers.host;
            if (domain.test(host)) {
                return fw(req,res,next);
            } else if (moved && rdc(moved,res,host)) {
                return;
            }
        } catch (TypeError) {
            // pass
        }
        return end(next);
    };
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
    var domain, moved;
    var fw, proxy;
    var next = Object.create(null);

    if (Array.isArray(options.redirect) == true) {
        moved = builder(options.redirect,options.domain);
        next.moved = moved;
    }

    if (options.framework && typeof (options.framework) == 'function') {
        fw = options.framework;
        next.framework = fw;
    } else if (options.proxies && typeof (options.proxies) == 'object') {
        proxy = require('http-proxy').createProxyServer(options.proxies);
        next.proxies = proxy;
    }

    if (options.dynamic) {
        return dynamics(String(options.dynamic));
    } else if (domain = options.domain) {
        if (domain.constructor.name == 'RegExp') {
            domain = domain.source;
        } else if (typeof (domain) != 'string') {
            throw new Error('invalid "domain" argument');
        }
        domain = expression(domain);
        next.domain = domain;
    } else {
        throw new Error('"domain" is required');
    }

    if (options.static) {
        return statics(String(options.static),next);
    } else if (fw) {
        return framework(domain,moved,fw);
    } else if (proxy) {
        return proxies(domain,moved,proxy);
    } else {
        throw new Error('"framework" or "proxies" are required');
    }
};
