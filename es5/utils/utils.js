"use strict";

require("babel-polyfill");
var _ = require('underscore')._;
var async = require("async");
var scan = require("./scan");
var fs = require("fs");
var path = require('path');
var parsersHelper = require("./parsersHelper");

var utils = module.exports = {
        counter: {},
        start: 0,
        getCount: function getCount(counterName) {
                if (_.isUndefined(parsersHelper.counter[counterName])) {
                        parsersHelper.counter[counterName] = 1;
                } else {
                        parsersHelper.counter[counterName]++;
                }
                return counterName + ">" + parsersHelper.counter[counterName];
        },
        startTimer: function startTimer() {
                utils.start = new Date().getTime();
        },
        stopTimer: function stopTimer() {
                var end = new Date().getTime();
                var time = end - utils.start;
                console.log('Execution time: ' + time / 1000);
        },
        read: function read(path) {
                return new Promise(function (resolve, reject) {
                        fs.readFile(path, "utf-8", function (error, data) {
                                resolve([path, data]);
                        });
                });
        },
        writefile: function writefile(file) {

                return function (buffer) {
                        return new Promise(function (resolve, reject) {
                                fs.writeFile(file, buffer, function (err) {
                                        if (err) reject(err);else resolve();
                                });
                        });
                };
        },
        read_node: function read_node(node) {
                return new Promise(function (resolve, reject) {
                        fs.readFile(node.name, "utf-8", function (error, data) {
                                resolve([node, data]);
                        });
                });
        },
        correctPathSync: function correctPathSync(filePath, parent, extension) {
                var folder = parent.match(/(.*)[\/\\]/)[1] || '';
                var mixedPath = path.normalize(folder + "/" + filePath);
                mixedPath = mixedPath.replace(/\\/g, "\/").replace("//", "/");
                if (extension && mixedPath.substr(mixedPath.length - extension.length) !== extension) {
                        mixedPath = mixedPath + extension;
                }
                return mixedPath;
        },
        normalize: function normalize(filePath, folder) {
                if (folder === undefined) {
                        folder = "";
                } else {
                        folder = folder + "/";
                }
                var mixedPath = path.normalize(folder + filePath);
                mixedPath = mixedPath.replace(/\\/g, "\/").replace("//", "/");
                return mixedPath;
        },
        append: function append(file, text) {
                fs.appendFileSync(file, text + "\n");
        },
        scanFiles: function scanFiles(website_folder, filter) {
                return new Promise(function (resolve, reject) {
                        scan(website_folder, filter, false, function (err, fileList) {
                                if (err) {
                                        reject(err);
                                } else {
                                        resolve(fileList);
                                }
                        });
                });
        },
        escapeHTML: function escapeHTML(text) {
                var chr = {
                        '"': "",
                        "&": "",
                        "<": "",
                        ">": "",
                        "@": ""
                };

                function abc(a) {
                        return chr[a];
                }
                return text.replace(/[\"&<>]/g, abc);
        }
};
//# sourceMappingURL=utils.js.map