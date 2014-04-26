#!/usr/bin/env node
/*jslint node: true, browser: false, maxlen: 120 */

"use strict";

var fs, path, chalk, filesize, nopt, glob, lodash, files, args, crushpng;

// Require built-in modules
path = require("path");
fs   = require("fs");

// For displaying the results
chalk    = require("chalk");
filesize = require("filesize");

// For parsing the command line arguments
nopt   = require("nopt");
glob   = require("glob");
lodash = require("lodash");

/**
 * Display the help section
 */
function die() {
    console.warn("Usage:", path.basename(process.argv[1]), "--apikey <apikey> <files> ...", "\n");
    process.exit(1);
}

/**
 * Handle the response form TinyPNG
 */
function replyHandler(err, result) {

    var message;

    if (err) {

        if (err.code) {

            // Could not read the local file
            if (err.code === "ENOENT") {
                message = ["-", chalk.red("✘"), chalk.grey(err.path), chalk.red("File not found")];

            // Other HTTP errors
            } else {
                message = ["-", chalk.red("✘"), chalk.grey(err.path), err.code, chalk.red(err.message)];
            }


        } else {

            // Errors without attached codes
            message = ["-", chalk.red("✘ There was an error"), JSON.stringify(err)];
        }

        console.error(message.join(" "));
        return;
    }

    // How did we do?
    result.input.size = filesize(result.input.size);
    result.output.size = filesize(result.output.size);

    // If the ratio is >= 1, then the file was not reduced and so there is no point in overwriting it
    if (result.output.ratio >= 1) {
        message = ["-", chalk.green("✓"), chalk.grey(result.input.name), result.input.size, "(Already optimized)"];
        console.log(message.join(" "));
        return;
    }

    // So the filesize was reduced. Conver the reduction to a percentage and then save the file
    result.output.reduction = (100 - Math.round(result.output.ratio * 100)) + "%";
    fs.writeFile(result.input.name, result.output.image, {"encoding": "binary"}, function (err) {

        if (err) {
            message = ["-", chalk.red("✘"), chalk.grey(result.input.name), "Error saving file"];
            console.error(message.join(" "));
            return;
        }

        // Log what we have done
        message = [result.output.size, "(was", result.input.size + ",", result.output.reduction, "reduction)"];
        message = ["+", chalk.green("✓"), chalk.grey(result.input.name), message.join(" ")];
        console.log(message.join(" "));
    });
}

// Parse the command line arguments
args = nopt({
    "apikey": [String]
}, {}, process.argv, 2);

// Validate we have an API key
if (!args.hasOwnProperty("apikey")) {
    die();
}

// Process the command line arguments into an array of files
files = lodash.flatten(args.argv.remain, false, function (file) {
    return glob.sync(file);
});

// Loop over the file list and optimize each file
crushpng = require("../lib/crushpng.js");
lodash.unique(files).forEach(function (file) {
    file = path.resolve(process.cwd(), file);
    crushpng(file, { "apikey": args.apikey }, replyHandler);
});
