# crushpng

Crush PNG images with [TinyPNG.org](https://tinypng.org/).

## Command Line

Install with [NPM](https://www.npmjs.org/package/crushpng).

```bash
$ npm install -g crushpng
$ crushpng images/*.png --apikey XXXXXXXXXX
```

## As a module

### Install
```bash
$ npm install --save-dev crushpng
````

### Use
```js
"use strict";

var crushpng = require("crushpng");
crushpng("image.png", { "apikey": "XXXXXXXXXX" }, function (err, crushed) {
    // crushed = {
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
* `onlyStats`: Do not download the crushed file (optional, default: false)

```js
"use strict";

var crushpng, settings;

crushpng = require("crushpng");
settings = {
    "apikey": "XXXXXXXXXX",
    "onlyStats": true
};

crushpng("image.png", settings, function (err, crushed) {
    // crushed = {
    //     "input": {
    //          "size": 207565,
    //          "name": "image.png"
    //     },
    //     "output": {
    //         "size": 63669,
    //         "ratio": 0.307,
    //         "url": "https://path.to.crushed/image.png"
    //     }
    // }
});
