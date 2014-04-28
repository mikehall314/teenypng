# teenypng

Optimize PNG images with [TinyPNG.org](https://tinypng.org/).

## Command Line

Install with [NPM](https://www.npmjs.org/package/teenypng).

```bash
$ npm install -g teenypng
$ teenypng images/*.png --apikey XXXXXXXXXX
```

## As a module

### Install
```bash
$ npm install --save-dev teenypng
```

### Use
```js
"use strict";

var teenypng = require("teenypng");
teenypng("image.png", { "apikey": "XXXXXXXXXX" }, function (err, optimized) {
    // optimized = {
    //     "input": {
    //          "size": 207565,
    //          "name": "image.png"
    //     },
    //     "output": {
    //         "size": 63669,
    //         "ratio": 0.307,
    //         "image": <Buffer with compressed image>
    //     }
    // }
});
```

### Settings

* `apikey`: Your API key from TinyPNG.org (required)
* `onlyStats`: Do not download the optimized file (optional, default: false)

```js
"use strict";

var teenypng, settings;

teenypng = require("teenypng");
settings = {
    "apikey": "XXXXXXXXXX",
    "onlyStats": true
};

teenypng("image.png", settings, function (err, optimized) {
    // optimized = {
    //     "input": {
    //          "size": 207565,
    //          "name": "image.png"
    //     },
    //     "output": {
    //         "size": 63669,
    //         "ratio": 0.307,
    //         "url": "https://path.to.optimized/image.png"
    //     }
    // }
});
```

### Tests
Test with nodeunit
```bash
$ npm test
```
