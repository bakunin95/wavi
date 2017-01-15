"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("babel-polyfill");
//NodeJS dependencies
var co = require('co');
var path = require('path');
var async = require("async");
var mkdirp = require('mkdirp');
var getDirName = require('path').dirname;
var fs = require("fs");
var _ = require('underscore')._;

//Wavi local dependencies
var utils = require("./utils/utils");
var css_parser = require("./parsers/css");
var html_parser = require("./parsers/html");
var javascript_parser = require("./parsers/javascript");
var graph = require("./lib/graph");
var db = require("./lib/database");

var instance = null;

var Wavi = function () {
    function Wavi() {
        _classCallCheck(this, Wavi);

        if (!instance) {
            instance = this;
        }

        return instance;
    }

    _createClass(Wavi, [{
        key: "analyze",
        value: function analyze(options, website_folder, website_target) {

            website_folder = path.resolve(website_folder).replace(/\\/g, '\/');
            website_target = path.resolve(website_target).replace(/\\/g, '\/');

            console.log("Processing website: " + website_folder);

            var identifiedFiles;

            var WRITE_RESULTS_TO_JSON = false;

            var WRITE_RESULTS_TO_DOT = false;

            co(regeneratorRuntime.mark(function _callee() {
                var all_files, js_files, html_files, css_files, dotResult, resultSvg;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:

                                utils.startTimer();

                                _context.next = 3;
                                return utils.scanFiles(website_folder, ['js', 'html', 'css']);

                            case 3:
                                all_files = _context.sent;
                                _context.next = 6;
                                return instance.indentifyFiles(all_files);

                            case 6:
                                identifiedFiles = _context.sent;


                                db.setIdentifiedFiles(identifiedFiles);

                                js_files = _.pluck(_.where(db.getClasses(), { type: 'js' }), "name");
                                html_files = _.where(db.getClasses(), { type: 'html' });
                                css_files = _.where(db.getClasses(), { type: 'css' });
                                _context.next = 13;
                                return [css_files.map(css_parser.operation_css), html_files.map(html_parser.operation_html), js_files.map(javascript_parser.operation)];

                            case 13:
                                dotResult = graph.createDot(options, db.getClasses(), db.getRelations());

                                if (!(WRITE_RESULTS_TO_JSON === true)) {
                                    _context.next = 17;
                                    break;
                                }

                                _context.next = 17;
                                return [utils.writefile("data.json")(JSON.stringify(db.getClasses(), 0, 4)), utils.writefile("relations.json")(JSON.stringify(db.getRelations(), 0, 4))];

                            case 17:

                                if (WRITE_RESULTS_TO_DOT === true) {
                                    try {
                                        fs.unlinkSync("test.dot");
                                    } catch (e) {}
                                }
                                console.log("finished analyzing, now generating graph");

                                resultSvg = graph.generateGraph(dotResult);
                                _context.next = 22;
                                return utils.writefile(website_target)(resultSvg);

                            case 22:

                                console.log("Graph generated: " + website_target);

                                utils.stopTimer();

                            case 24:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            })).catch(instance.onerror);
        }
    }, {
        key: "onerror",
        value: function onerror(err) {
            console.error(err.stack);
        }
    }, {
        key: "indentifyFiles",
        value: function indentifyFiles(fileList) {
            var newList = [];
            return new Promise(function (resolve, reject) {
                var ids = 0;
                _.each(fileList, function (item) {

                    //item = utils.correctPathSync(item);

                    //item = path.normalize(item);

                    var color = "lightyellow";
                    var type = "js";
                    if (item.slice(-5) === ".html") {
                        color = "lightsalmon";
                        type = "html";
                    }
                    if (item.slice(-4) === ".css") {
                        color = "lightgreen";
                        type = "css";
                    }
                    var id = db.addClass({ name: item, fill: color, type: type, cluster: "cluster_" + ids, is_global: true });
                    newList.push({ name: item, id: id, cluster: "cluster_" + ids });
                    ids += 1;
                });
                resolve(newList);
            });
        }
    }]);

    return Wavi;
}();

/*



*/

module.exports = new Wavi();
//# sourceMappingURL=index.js.map