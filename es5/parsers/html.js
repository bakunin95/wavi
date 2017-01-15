'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var utils = require("../utils/utils");
var cheerio = require('cheerio');
var _ = require('underscore')._;
var db = require("../lib/database");

var instance = null;

var Html = function () {
        function Html() {
                _classCallCheck(this, Html);

                if (!instance) {
                        instance = this;
                }

                return instance;
        }

        _createClass(Html, [{
                key: 'find_html_elements',
                value: function find_html_elements(result) {
                        return new Promise(function (resolve, reject) {
                                var parent = result[0];
                                var $ = result[1];

                                _.each($.root(), function (elem) {
                                        instance.recursive_element($, elem, null, parent);
                                });

                                resolve();
                        });
                }
        }, {
                key: 'recursive_element',
                value: function recursive_element($, elem, parent, parent_file) {

                        var tag = $(elem).get(0).tagName;
                        var value = void 0;
                        var name = "";
                        var type = tag;
                        var current = parent_file.key;
                        if (parent !== null) {
                                current = parent.key;
                        }

                        if (tag === "script") {
                                if ($(elem).attr("src") !== undefined) {
                                        var correctedPath = utils.correctPathSync($(elem).attr("src"), parent_file.name, ".js");
                                        var candidate = _.findWhere(db.getIdentifiedFiles(), { name: correctedPath });
                                        if (candidate !== undefined) {
                                                db.addRelations({ from: parent_file.key, to: candidate.id, relationship: "", cluster: true });
                                        }
                                }
                        }

                        if (tag === "link") {
                                if ($(elem).attr("href") !== undefined) {
                                        var _correctedPath = utils.correctPathSync($(elem).attr("href"), parent_file.name);

                                        var _candidate = _.findWhere(db.getIdentifiedFiles(), { name: _correctedPath });
                                        if (_candidate !== undefined) {
                                                db.addRelations({ from: parent_file.key, to: _candidate.id, relationship: "", cluster: true });
                                        }
                                }
                        }

                        if ($(elem).children().length === 0) {
                                name = tag;

                                if ($(elem).attr("id") !== undefined) {
                                        name = $(elem).attr("id");
                                }

                                if (_.contains(['link', 'a', 'ddd'], tag)) {
                                        value = $(elem).attr("href");
                                }

                                if (tag === "script") {
                                        value = $(elem).attr("src");
                                }

                                if (tag === "a") {
                                        name = "link";
                                }

                                db.addProperty(current, { name: name, value: value, type: type, visibility: "+" });
                        } else {
                                var classId = db.addClass({ name: name, fill: "pink", type: type, file: parent_file.name, cluster: parent_file.cluster });
                                db.addRelations({ from: current, to: classId, relationship: "composition" });
                                current = classId;
                                parent = db.getClass(classId);
                        }

                        if ($(elem).children().length > 0) {
                                _.each($(elem).children(), function (child) {
                                        instance.recursive_element($, child, parent, parent_file);
                                });
                        }
                }
        }, {
                key: 'operation_html',
                value: function operation_html(file) {
                        return new Promise(function (resolve, reject) {
                                Promise.resolve(file).then(utils.read_node).then(instance.parse_dom).then(instance.find_html_elements).catch(function (error) {
                                        console.log("err", error);
                                }).then(function () {
                                        resolve();
                                });
                        });
                }
        }, {
                key: 'parse_dom',
                value: function parse_dom(result) {
                        return new Promise(function (resolve, reject) {
                                var node = result[0];
                                var data = result[1];
                                var $ = cheerio.load(data);
                                resolve([node, $]);
                        });
                }
        }]);

        return Html;
}();

module.exports = new Html();
//# sourceMappingURL=html.js.map