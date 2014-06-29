#top-vhost [![Build Status](https://travis-ci.org/hex7c0/top-vhost.svg?branch=master)](https://travis-ci.org/hex7c0/top-vhost) [![NPM version](https://badge.fury.io/js/top-vhost.svg)](http://badge.fury.io/js/top-vhost)

sitemap and robots for [expressjs 4](http://expressjs.com/)

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
 - `framework` - **Function** Functions releated to this virtual host *(required)*
 - `port` - **Integer** If Port is set, send raw request like a proxy *(default "disabled")*

#### Examples

Take a look at my [examples](https://github.com/hex7c0/top-vhost/tree/master/examples)

## License
Copyright (c) 2014 hex7c0

Licensed under the GPLv3 license
