"use strict";
/**
 * @file top-vhost main
 * @module top-vhost
 * @package top-vhost
 * @subpackage main
 * @version 1.4.0
 * @author hex7c0 <hex7c0@gmail.com>
 * @copyright hex7c0 2014
 * @license GPLv3
 */

/*
 * initialize module
 */
var fs = require('fs');
var redirect = redirect301;

/*
 * common functions
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
 * http permanently redirect status code
 * 
 * @function redirect301
 * @param {Object} req - request
 * @param {Object} res - response
 * @param {Object} moved - regex url
 * @param {String} host - req.headers.host
 * @param {String} url - req.url
 * @return {Boolean}
 */
function redirect301(req,res,moved,host,url) {

    var reg = moved.reg;
    for (var i = 0, ii = reg.length; i < ii; i++) {
        if (reg[i].test(host)) {
            try {
                res.redirect(301,moved.orig + url);
            } catch (TypeError) {
                res.statusCode = 301;
                res.setHeader('Location:',moved.orig + url);
            }
            res.end();
            return true;
        }
    }
    return false;
}

/**
 * http temporary redirect status code
 * 
 * @function redirect307
 * @param {Object} req - request
 * @param {Object} res - response
 * @param {Object} moved - regex url
 * @param {String} host - req.headers.host
 * @param {String} url - req.url
 * @return {Boolean}
 */
function redirect307(req,res,moved,host,url) {

    var reg = moved.reg;
    for (var i = 0, ii = reg.length; i < ii; i++) {
        if (reg[i].test(host)) {
            try {
                res.redirect(307,moved.orig + url);
            } catch (TypeError) {
                res.statusCode = 307;
                res.setHeader('Location:',moved.orig + url);
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

    url = url.replace(/http([s]{0,1}):\/\//,'').replace(/\*/g,'([^\.]+)');
    // add starting index
    if (url[0] != '^') {
        url = '^' + url;
    }
    // if (url[url.length - 1] == '$') {
    // url = url.slice(0,url.length - 1);
    // }
    return new RegExp(url,'i');
}

/**
 * ending function
 * 
 * @function end
 * @param {Function} next - next op
 * @return {Boolean}
 */
function end(next) {

    try {
        next()
    } catch (TypeError) {
        // pass
    }
    return false;
}

/*
 * return functions
 */

/**
 * proxy work
 * 
 * @function strip
 * @param {Array} moved - http(s) redirect
 * @return {Function}
 */
function strip(moved) {

    var moved = moved;
    var rdc = redirect
    return function vhost(req,res,next) {

        return rdc(null,res,moved,'*',req.url);
    };
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

        try {
            var host = req.headers.host;
            if (domain.test(host)) {
                proxy.web(req,res);
                return true;
            } else if (moved && rdc(null,res,moved,host,req.url)) {
                return true;
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

        try {
            var host = req.headers.host;
            if (domain.test(host)) {
                fw(req,res,next);
                return true;
            } else if (moved && rdc(null,res,moved,host,req.url)) {
                return true;
            }
        } catch (TypeError) {
            // pass
        }
        return end(next);
    };
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
        throw new Error(file + ' not exists');
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
            try {
                var host = req.headers.host;
                if (domain.test(host)) {
                    proxy.web(req,res);
                    return true;
                } else if (moved && rdc(null,res,moved,host,req.url)) {
                    return true;
                }
            } catch (TypeError) {
                break;
            }
        };
        return end(next);
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
        throw new Error(file + ' not exists');
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
        if (obj.orig) {
            moved = builder(d.redirect,obj.orig);
        } else if (d.domain) {
            moved = builder(d.redirect,d.domain);
        }
    }

    // return
    if (obj.framework) {
        return framework(domain,moved,obj.framework);
    } else if (obj.proxies) {
        return proxies(domain,moved,obj.proxies);
    } else if (d.dynamic) {
        return dynamics(String(d.dynamic));
    } else if (d.proxies && typeof (d.proxies) == 'object') {
        var proxy = require('http-proxy').createProxyServer(d.proxies);
        return proxies(domain,moved,proxy);
    } else {
        throw new Error('"framework" or "proxies" are required');
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
    var domain, fw, proxy;
    var moved, temp;
    var next = Object.create(null);

    // single
    if (options.file) {
        console.error('top-vhost > "file" option is deprecated');
    }
    if (Array.isArray(options.redirect) == true) {
        moved = builder(options.redirect,options.domain.source
                || options.domain);
        next.moved = moved;
    }
    if (temp = Number(options.redirectStatus)) {
        if (temp == 301) {
            redirect = redirect301;
        } else if (temp == 307) {
            redirect = redirect307;
        }
        next.redirectStatus = temp;
    }

    // exclusive
    if (options.framework && typeof (options.framework) == 'function') {
        fw = options.framework;
        next.framework = fw;
    } else if (options.proxies && typeof (options.proxies) == 'object') {
        proxy = require('http-proxy').createProxyServer(options.proxies);
        next.proxies = proxy;
    }

    // domain
    if (domain = options.domain) {
        if (domain.constructor.name == 'RegExp') {
            domain = domain.source;
        } else if (typeof (domain) != 'string') {
            throw new Error('invalid "domain" argument');
        }
        domain = expression(domain);
        next.domain = domain;
        next.orig = options.domain.source || options.domain;
    } else if (options.dynamic || options.static) {
        // pass
    } else {
        throw new Error('"domain" is required');
    }

    // extra
    if (options.stripWWW || options.stripHTTP || options.stripHTTPS) {
        if (typeof (moved) != 'object') {
            moved = {
                reg: [],
                orig: domain,
            };
        }
        temp = options.domain.source || options.domain;
        if (options.stripHTTP) {
            moved.orig = temp.replace(/http:\/\//,'https://');
            moved.reg = [/./];
            return strip(moved);
        } else if (options.stripHTTPS) {
            moved.orig = temp.replace(/https:\/\//,'http://');
            moved.reg = [/./];
            return strip(moved);
        } else if (options.stripWWW) {
            moved.reg.push(/^www./);
            next.stripWWW = true;
        }
    }

    // return
    if (options.dynamic) {
        return dynamics(String(options.dynamic));
    } else if (options.static) {
        return statics(String(options.static),next);
    } else if (fw) {
        return framework(domain,moved,fw);
    } else if (proxy) {
        return proxies(domain,moved,proxy);
    } else {
        throw new Error('"framework" or "proxies" are required');
    }
};
