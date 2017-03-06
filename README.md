# [top-vhost](https://github.com/hex7c0/top-vhost)

[![NPM version](https://img.shields.io/npm/v/top-vhost.svg)](https://www.npmjs.com/package/top-vhost)
[![Linux Status](https://img.shields.io/travis/hex7c0/top-vhost.svg?label=linux-osx)](https://travis-ci.org/hex7c0/top-vhost)
[![Windows Status](https://img.shields.io/appveyor/ci/hex7c0/top-vhost.svg?label=windows)](https://ci.appveyor.com/project/hex7c0/top-vhost)
[![Dependency Status](https://img.shields.io/david/hex7c0/top-vhost.svg)](https://david-dm.org/hex7c0/top-vhost)
[![Coveralls](https://img.shields.io/coveralls/hex7c0/top-vhost.svg)](https://coveralls.io/r/hex7c0/top-vhost)

Top-Down virtual host for [nodejs](http://nodejs.org/).
Optional, you can set this module like a proxy or a redirect.

## Installation

Install through NPM

```bash
npm install top-vhost
```
or
```bash
git clone git://github.com/hex7c0/top-vhost.git
```

## API

inside expressjs project
```js
var vhost = require('top-vhost');
var father = require('express')();
var child = require('express')();

child.get('/',function(req,res) {

  res.send('hello');
});

father.use(vhost({
  domain: 'foo.com',
  framework: child,
})).listen(3000);
```

### vhost(options)

#### options

 - `domain` - **String | RegExp** Name or Regex of virtual host *(required)*
 - `dynamic` - **String** Path of dynamic configuration json file (only with Proxies). Array of hosts *(default "disabled")*
 - `static` - **String** Path of static configuration json file. Preserve options *(default "disabled")*
 - `redirect` - **Array** Array of url that will be redirected to this domain *(default "disabled")*
 - `redirectStatus` - **Number** Set type of HTTP header for redirect (permanently 301 or temporary 307) or use another *(default "301")*
 - `insensitive` - **Boolean** Set True if want parse insensitive match *(default "sensitive")*
 - `stripWWW` - **Boolean** Stripe all "www." url *(default "disabled")*
 - `stripOnlyWWW` - **Boolean** Redirect all "www." url to "." url *(default "disabled")*
 - `stripHTTP` - **Boolean** Redirect all "http://" to "https://" url *(default "disabled")*
 - `stripHTTPS` - **Boolean** Redirect all "https://" to "http://" url *(default "disabled")*
 - `framework` - **Function** Functions related to this virtual host *(optional)*
 - `proxies` - **Object** Object for build http proxy, related to [`http-proxy`](https://github.com/nodejitsu/node-http-proxy) *(optional)*

related to https://github.com/nodejitsu/node-http-proxy/blob/master/lib/http-proxy.js#L29-L52

## Examples

Take a look at my [examples](examples)

### [License GPLv3](LICENSE)