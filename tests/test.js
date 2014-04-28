/*jslint node: true */
/*global it */

"use strict";

var defaults, prompt, fs, teenypng, lodash;

prompt  = require("prompt");
fs      = require("fs");
lodash  = require("lodash");
teenypng = require("../lib/teenypng.js");

module.exports.test = {

    "setUp": function (next) {

        if (defaults) {
            return next();
        }

        prompt.start();
        prompt.get({
            name: "apikey",
            description: 'Enter your TinyPNG API Key',
            type: 'string',
            required: true
        }, function (err, result) {

            if (err) {
                throw err;
            }

            // Merge user data with defaults to make
            defaults = result;
            next();
        });
    },

    "should reduce filesize": function (test) {

        var testFile = "./tests/image.png";

        test.expect(2);

        teenypng(testFile, defaults, function (err, optimized) {

            var fileIsReduced;

            test.ifError(err);

            fileIsReduced = optimized.output.ratio < 1;

            test.ok(fileIsReduced);
            test.done();
        });
    },

    "onlyStats should not download file": function (test) {

        var settings, testFile;

        testFile = "./tests/image.png";
        settings = lodash.extend({}, defaults, { "onlyStats": true });

        test.expect(2);

        teenypng(testFile, settings, function (err, stats) {

            test.ifError(err);

            test.ok(!stats.image);
            test.done();
        });
    }
};
