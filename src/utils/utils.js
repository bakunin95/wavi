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
        getCount: function (counterName) {
                if (_.isUndefined(parsersHelper.counter[counterName])) {
                        parsersHelper.counter[counterName] = 1;
                }
                else {
                        parsersHelper.counter[counterName]++;
                }
                return counterName + ">" + parsersHelper.counter[counterName];
        },
        startTimer: function () {
                utils.start = new Date().getTime();
        },
        stopTimer: function () {
                var end = new Date().getTime();
                var time = end - utils.start;
                console.log('Execution time: ' + time / 1000);
        },
        read: function (path) {
                return new Promise(
                        function (resolve, reject) {
                                fs.readFile(path, "utf-8", function (error, data) {
                                        resolve([path, data]);
                                })
                        });
        },
        writefile: function (file) {

                return function (buffer) {
                        return new Promise(function (resolve, reject) {
                                fs.writeFile(file, buffer, function (err) {
                                        if (err) reject(err)
                                        else resolve()
                                })
                        })
                }
        },
        read_node: function (node) {
                return new Promise(
                        function (resolve, reject) {
                                fs.readFile(node.name, "utf-8", function (error, data) {
                                        resolve([node, data]);
                                })
                        });
        },
        correctPathSync: function (filePath, parent, extension) {
                let folder = parent.match(/(.*)[\/\\]/)[1] || '';
                var mixedPath = path.normalize(folder + "/" + filePath);
                mixedPath = mixedPath.replace(/\\/g, "\/").replace("//", "/");
                if (extension && mixedPath.substr(mixedPath.length - extension.length) !== extension) {
                        mixedPath = mixedPath + extension;
                }
                return mixedPath;

        },
        normalize: function (filePath, folder) {
                if (folder === undefined) {
                        folder = "";
                }
                else{
                       folder =  folder + "/"
                }
                var mixedPath = path.normalize(folder + filePath);
                mixedPath = mixedPath.replace(/\\/g, "\/").replace("//", "/");
                return mixedPath;

        },
        append: function (file, text) {
                fs.appendFileSync(file, text + "\n");
        },
        scanFiles: function (website_folder, filter) {
                return new Promise(function (resolve, reject) {
                        scan(website_folder, filter, false, function (err, fileList) {
                                if (err) {
                                        reject(err);
                                }
                                else {
                                        resolve(fileList);
                                }
                        });
                });
        },
        escapeHTML: function (text) {
                var chr = {
                        '"': "",
                        "&": "",
                        "<": "",
                        ">": "",
                        "@": ""
                };

                function abc(a) {
                        return chr[a]
                }
                return text.replace(/[\"&<>]/g, abc)
        }
};

