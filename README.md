#top-vhost [![Build Status](https://travis-ci.org/hex7c0/top-vhost.svg?branch=master)](https://travis-ci.org/hex7c0/top-vhost) [![NPM version](https://badge.fury.io/js/top-vhost.svg)](http://badge.fury.io/js/top-vhost)

top-down virtual host for [nodejs](http://nodejs.org/). Optional, you can set this module like a proxy or a redirect.

## Installation

Install through NPM

```
npm install top-vhost
```
or
```
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
}));
father.listen(3000);
```

### vhost(options)

 - `domain` - **String | RegExp** Name or Regex of virtual host *(required)*
 - `dynamic` - **String** Path of dynamic configuration json file (only with Proxies). Array of hosts *(default "disabled")*
 - `static` - **String** Path of static configuration json file. Preserve options *(default "disabled")*
 - `redirect` - **Array** Array of url that will be redirected to this domain *(default "disabled")*
 - `redirectStatus` - **301 | 307** Set type of HTTP header for redirect (permanently or temporary) *(default "301")*
 - `stripWWW` - **Boolean** Stripe all "www." url *(default "disabled")*
 - `stripHTTP` - **Boolean** Redirect all "http://" to "https://" url *(default "disabled")*
 - `stripHTTPS` - **Boolean** Redirect all "https://" to "http://" url *(default "disabled")*
 
 - `framework` - **Function** Functions releated to this virtual host *(optional)*
 
 - `proxies` - **Object** Object for build http proxy, related to [`http-proxy`](https://github.com/nodejitsu/node-http-proxy) *(optional)*

releated to https://github.com/nodejitsu/node-http-proxy/blob/master/lib/http-proxy.js#L34-L51

#### Examples

Take a look at my [examples](https://github.com/hex7c0/top-vhost/tree/master/examples)

## License
Copyright (c) 2014 hex7c0

Licensed under the GPLv3 license
