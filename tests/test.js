/*jslint node: true */
/*global it */

"use strict";

var settings, prompt, fs, tinypng, lodash;

prompt  = require("prompt");
fs      = require("fs");
lodash  = require("lodash");
tinypng = require("../lib/tinypng.js");

module.exports.test = {

    "setUp": function (next) {

        prompt.start().get({
            name: "apikey",
            description: 'Enter your TinyPNG API Key',
            type: 'string',
            required: true
        }, function (err, result) {

            if (err) {
                throw err;
            }

            // Merge user data with defaults to make
            settings = lodash.extend({}, result, {"onlyStats": true});
            next();
        });
    },

    "should reduce filesize": function (test) {

        var testFile = "./tests/image.png";

        test.expect(1);

        tinypng(testFile, settings, function (err, stats) {

            var fileIsReduced;

            if (err) {
                console.error("Failed to reduce file, got error code:", err);
                test.done();
                return;
            }

            // Did it work?
            fileIsReduced = stats.output.ratio < 1;
            test.ok(fileIsReduced);
            test.done();
        });
    }
};
