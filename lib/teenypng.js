/*jslint node: true */

"use strict";

var url, https, fs, messages;

url    = require("url");
https  = require("https");
fs     = require("fs");

messages = {
    "201": "Created",
    "401": "Unauthorized",
    "415": "Unsupported Media Type",
    "429": "Too Many Requests",
    "500": "Internal Server Error"
};

function teenypng(filename, settings, cb) {

    var data;

    // Support passing just the API key
    if (typeof settings === "string") {
        settings = {
            "apikey": settings
        };
    }

    // If there is no API key, then error
    if (!settings || !settings.apikey) {
        return cb("You must supply a TinyPNG API Key. Get yours from tinypng.com");
    }

    function tinypng(original) {

        var options, request;

        // Configure the request
        options = url.parse("https://api.tinypng.com/shrink");
        options.method = "POST";
        options.headers = {
            "Content-Type": "image/png",
            "Authorization": "Basic " + new Buffer("api:" + settings.apikey).toString("base64")
        };

        // Set up the response handler
        request = https.request(options, function didGetReply(reply) {

            var stats;

            // Check for errors
            if (reply.statusCode !== 201) {
                return cb({
                    "code": reply.statusCode,
                    "message": messages[reply.statusCode.toString()],
                    "path": filename
                });
            }

            // Read the data from the socket
            reply.on('data', function (chunk) {
                stats = stats ? Buffer.concat([stats, chunk]) : chunk;
            });

            // When we're done, process the reply
            reply.on('end', function () {

                // Interpret the stats as JSON
                try {
                    stats = JSON.parse(stats);
                } catch (e) {
                    return cb(e);
                }

                // Integrate original file
                stats.input.name = filename;
                stats.output.url = reply.headers.location;

                // If the user doesn't want the file, just
                // return the stats without getting the file.
                if (settings.onlyStats) {
                    return cb(null, stats);
                }

                // If there was no change or negative change, do no more.
                // Pop the original file buffer in there and return the stats
                if (stats.output.ratio >= 1) {
                    stats.output.optimized = original;
                    return cb(null, stats);
                }

                // Download the optimized image
                https.get(stats.output.url, function (readable) {

                    var optimized;

                    if (readable.statusCode !== 200) {
                        return cb(readable.statusCode);
                    }

                    readable.on("data", function (chunk) {
                        optimized = optimized ? Buffer.concat([optimized, chunk]) : chunk;
                    });

                    readable.on("end", function () {
                        delete stats.output.url;
                        stats.output.image = optimized;
                        cb(null, stats);
                    });
                });
            });

            // Handle errors in the event of an error
            request.on("error", function () {
                cb(arguments, null);
            });
        });

        // Dispatch the request
        request.write(original);
        request.end();
    }

    // If the file is a buffer, we can use it - but let's label it as a buffer
    if (Buffer.isBuffer(filename)) {
        data     = filename;
        filename = "<Buffer>";
        tinypng(data);
    } else {

        // Otherwise, assume it is a filename and read it from the disk
        fs.readFile(filename, function (err, data) {
            if (err) {
                return cb(err);
            }
            tinypng(data);
        });
    }
}

// Expose public API
module.exports = teenypng;
