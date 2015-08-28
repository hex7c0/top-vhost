'use strict';
/**
 * @file top-vhost main
 * @module top-vhost
 * @subpackage main
 * @version 1.8.0
 * @author hex7c0 <hex7c0@gmail.com>
 * @copyright hex7c0 2014
 * @license GPLv3
 */

/*
 * initialize module
 */
var setHeader = require('setheaders').setProctedHeader;

/*
 * functions
 */
/**
 * main
 * 
 * @function vhost
 * @export vhost
 * @param {Object} opt - various options. Check README.md
 * @return {Function}
 */
function vhost(opt) {

  /*
   * wrapper module
   */
  var redirect = redirect_body(301);
  var insensitive;

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
  function builder(moved, domain) {

    for (var i = 0, ii = moved.length; i < ii; ++i) {
      moved[i] = expression(moved[i]);
    }
    return {
      reg: moved,
      orig: domain,
    };
  }

  /**
   * http redirect builder
   * 
   * @function redirect_body
   * @param {Integer} res - response code
   * @return {Function}
   */
  function redirect_body(code) {

    var cod = code;

    /**
     * http redirect status code
     * 
     * @function
     * @param {Object} res - response
     * @param {Object} moved - regex url
     * @param {String} host - req.headers.host
     * @param {String} url - req.url
     */
    return function(res, moved, host, url) {

      var reg = moved.reg;

      for (var i = 0, ii = reg.length; i < ii; ++i) {
        if (reg[i].test(host)) {
          var to = moved.orig + url;
          setHeader(res, 'Location', to); // 0.11
          res.writeHead(cod, { // 0.10
            Location: to,
          });
          res.end();
          return true;
        }
      }
      return false;
    };
  }

  /**
   * regex builder
   * 
   * @function expression
   * @param {String} urls - url to be parsed
   * @return {RegExp}
   */
  function expression(urls) {

    var url = urls.replace(/http[s]?:\/\//i, '').replace(/\*/g, '([^.]+)');
    // add starting index
    if (url[0] != '^') {
      url = '^' + url;
    }
    // if (url[url.length - 1] === '$') {
    // url = url.slice(0,url.length - 1);
    // }
    return new RegExp(url, insensitive);
  }

  /*
   * return functions
   */
  /**
   * strip snippet
   * 
   * @function strip
   * @param {Array} moved - http(s) redirect
   * @return {Function}
   */
  function strip(moved) {

    return function vhost(req, res, next) {

      if (!redirect(res, moved, req.headers.host, req.url)) {
        next();
      }
      return;
    };
  }

  /**
   * proxy work
   * 
   * @function proxies
   * @param {RegExp} domain - vhost
   * @param {Array} moved - array of redirect
   * @param {Object} proxy - proxy
   * @return {Function}
   */
  function proxies(domain, moved, proxy) {

    var domainC = domain, proxyC = proxy;
    if (moved) {
      var mvd = moved, rdc = redirect;
      return function vhost(req, res, next) {

        var host = req.headers.host;
        if (domainC.test(host)) {
          proxyC.web(req, res);
          return;
        } else if (rdc(res, mvd, host, req.url)) {
          return;
        }
        return next();
      };
    }
    return function vhost(req, res, next) {

      var host = req.headers.host;
      if (domainC.test(host)) {
        return proxyC.web(req, res);
      }
      return next();
    };
  }

  /**
   * framework work
   * 
   * @function framework
   * @param {RegExp} domain - vhost
   * @param {Array} moved - array of redirect
   * @param {Object} fw - framework
   * @return {Function}
   */
  function framework(domain, moved, fw) {

    var domainC = domain, fwC = fw;
    if (moved) {
      var mvd = moved, rdc = redirect;

      return function vhost(req, res, next) {

        var host = req.headers.host;
        if (domainC.test(host)) {
          return fwC(req, res);
        } else if (rdc(res, mvd, host, req.url)) {
          return;
        }
        return next();
      };
    }
    return function vhost(req, res, next) {

      var host = req.headers.host;
      if (domainC.test(host)) {
        return fwC(req, res);
      }
      return next();
    };
  }

  /**
   * dynamic file
   * 
   * @function dynamic
   * @param {String} files - input file
   * @return {Function}
   */
  function dynamics(files) {

    var rdc = redirect, exp = expression;
    var file = require('path').resolve(files);
    var fs = require('fs');
    var http_proxy = require('http-proxy');
    if (!fs.existsSync(file)) {
      throw new Error(file + ' not exists');
    }

    return function vhost(req, res, next) {

      var host = req.headers.host;
      // file refresh; instead require(), that use cache
      var data = JSON.parse(fs.readFileSync(file, 'utf8'));
      for (var i = 0, ii = data.length; i < ii; ++i) {
        var moved;
        var d = data[i];
        if (Boolean(d.insensitive)) {
          insensitive = 'i';
        } else {
          insensitive = undefined;
        }
        var domain = exp(d.domain.source || d.domain);
        var proxy = http_proxy.createProxyServer(d.proxies);
        if (d.redirect) {
          moved = builder(d.redirect, d.domain.source || d.domain);
          if (domain.test(host)) {
            proxy.web(req, res);
            return true;
          }
          if (rdc(res, moved, host, req.url)) {
            return true;
          }
        }
        if (domain.test(host)) {
          proxy.web(req, res);
          return true;
        }
      }
      return next();
    };
  }

  /**
   * statics file
   * 
   * @function statics
   * @param {String} files - input file
   * @param {Object} obj - parsed options
   * @return {Function}
   */
  function statics(files, obj) {

    var file = require('path').resolve(files);
    if (!require('fs').existsSync(file)) {
      throw new Error(file + ' not exists');
    }
    var d = require(file);
    var domain, proxy;
    var moved, temp;

    // domain
    if (Boolean(d.insensitive)) {
      insensitive = 'i';
    } else {
      insensitive = undefined;
    }
    if (obj.domain) {
      domain = obj.domain;
    } else if ((domain = d.domain)) {
      if (domain.constructor.name === 'RegExp') {
        domain = domain.source;
      } else if (typeof (domain) != 'string') {
        throw new Error('invalid "domain" argument');
      }
      domain = expression(domain);
    } else if (d.dynamic) {
      // pass
    } else {
      throw new Error('"domain" is required');
    }

    // single
    if (obj.moved) {
      moved = obj.moved;
    } else if (Array.isArray(d.redirect) === true) {
      moved = builder(d.redirect, obj.orig || d.domain.source || d.domain);
    }
    if ((temp = Number(d.redirectStatus))) {
      redirect = redirect_body(temp);
    }

    // extra
    if (d.stripWWW || d.stripOnlyWWW || d.stripHTTP || d.stripHTTPS) {
      temp = obj.orig || d.domain.source || d.domain;
      if (d.stripHTTP) {
        return strip({
          reg: [ /./ ],
          orig: temp.replace(/http:\/\//i, 'https://'),
        });
      }
      if (d.stripHTTPS) {
        return strip({
          reg: [ /./ ],
          orig: temp.replace(/https:\/\//i, 'http://'),
        });
      }
      if (d.stripOnlyWWW) {
        return strip({
          reg: [ /^www./ ],
          orig: temp.replace(/www./i, '.'),
        });
      }
      if (d.stripWWW) {
        if (typeof (moved) != 'object') {
          moved = {
            reg: [ /^www./ ],
            orig: domain,
          };
        } else {
          moved.reg.push(/^www./);
        }
      }
    }

    // return
    if (d.dynamic) {
      return dynamics(String(d.dynamic));
    } else if (obj.framework) {
      return framework(domain, moved, obj.framework);
    } else if (obj.proxies) {
      return proxies(domain, moved, obj.proxies);
    } else if (d.proxies && typeof (d.proxies) === 'object') {
      proxy = require('http-proxy').createProxyServer(d.proxies);
      return proxies(domain, moved, proxy);
    }
    throw new Error('"framework" or "proxies" are required');
  }

  var options = opt || Object.create(null);
  var domain, fw, proxy;
  var moved, temp;
  var next = Object.create(null);

  // exclusive
  if (options.framework && typeof (options.framework) === 'function') {
    fw = options.framework;
    next.framework = fw;
  } else if (options.proxies && typeof (options.proxies) === 'object') {
    proxy = require('http-proxy').createProxyServer(options.proxies);
    next.proxies = proxy;
  }

  // domain
  if (Boolean(options.insensitive)) {
    insensitive = 'i';
  } else {
    insensitive = undefined;
  }
  domain = options.domain;
  if (domain) {
    if (domain.constructor.name === 'RegExp') {
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

  // single
  if (options.file) {
    console.info('top-vhost > "file" option is deprecated');
  }
  if (Array.isArray(options.redirect) === true) {
    moved = builder(options.redirect, options.domain.source || options.domain);
    next.moved = moved;
  }
  if ((temp = Number(options.redirectStatus))) {
    redirect = redirect_body(temp);
  }

  // extra
  if (options.stripWWW || options.stripOnlyWWW || options.stripHTTP
    || options.stripHTTPS) {
    temp = options.domain.source || options.domain;
    if (options.stripHTTP) {
      return strip({
        reg: [ /./ ],
        orig: temp.replace(/http:\/\//i, 'https://'),
      });
    } else if (options.stripHTTPS) {
      return strip({
        reg: [ /./ ],
        orig: temp.replace(/https:\/\//i, 'http://'),
      });
    } else if (options.stripOnlyWWW) {
      return strip({
        reg: [ /^www./ ],
        orig: temp.replace(/www./i, '.'),
      });
    }
    if (options.stripWWW) {
      if (typeof (moved) != 'object') {
        moved = {
          reg: [ /^www./ ],
          orig: domain,
        };
      } else {
        moved.reg.push(/^www./);
      }
    }
  }

  // return
  if (options.dynamic) {
    return dynamics(String(options.dynamic));
  } else if (options.static) {
    return statics(String(options.static), next);
  } else if (fw) {
    return framework(domain, moved, fw);
  } else if (proxy) {
    return proxies(domain, moved, proxy);
  }
  throw new Error('"framework" or "proxies" are required');
}
module.exports = vhost;
