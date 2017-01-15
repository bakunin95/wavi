"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cssparse = require("css").parse;
var utils = require("../utils/utils");
var db = require("../lib/database");
var async = require("async");
var _ = require('underscore')._;
var path = require('path');

var instance = null;

var Css = function () {
        function Css() {
                _classCallCheck(this, Css);

                if (!instance) {
                        instance = this;
                }

                return instance;
        }

        _createClass(Css, [{
                key: "operation_css",
                value: function operation_css(file) {
                        return new Promise(function (resolve, reject) {
                                Promise.resolve(file).then(utils.read_node).then(instance.parse_css).then(instance.find_css_elements).catch(function (error) {
                                        console.log(error);
                                }).then(function () {
                                        resolve();
                                });
                        });
                }
        }, {
                key: "parse_css",
                value: function parse_css(result) {
                        return new Promise(function (resolve, reject) {
                                try {
                                        var _path = result[0];
                                        var data = result[1];
                                        var ast = cssparse(data);
                                        resolve([_path, ast]);
                                } catch (e) {

                                        reject("File contain syntax error: " + result[0].name);
                                }
                        });
                }
        }, {
                key: "find_css_elements",
                value: function find_css_elements(result) {
                        return new Promise(function (resolve, reject) {
                                var parent = result[0];
                                var ast = result[1];

                                async.each(ast.stylesheet.rules, function (rule, cbVar) {
                                        if (rule.selectors !== null && _.isUndefined(rule.selectors) == false) {
                                                (function () {
                                                        var name = utils.escapeHTML(rule.selectors.join(" "));
                                                        var value = rule.declarations.length + " props";

                                                        var classId = db.addClass({ name: name, fill: "palegreen", file: parent.name, cluster: parent.cluster });
                                                        db.addRelations({ from: parent.key, to: classId, relationship: "composition" });

                                                        _.each(rule.declarations, function (declaration) {
                                                                var prop = db.addProperty(classId, { name: declaration.property, value: declaration.value, type: "", visibility: "+" });
                                                        });

                                                        cbVar();

                                                        /*async.each(rule.declarations, function (declaration, cbRule) {
                                                            let prop = db.addProperty(classId, { name: declaration.property, value: declaration.value, type: "", visibility: "+" });
                                                            cbRule();
                                                        }, function (err) {
                                                            cbVar();
                                                        })*/
                                                })();
                                        } else {
                                                        cbVar();
                                                }
                                }, function (err) {
                                        resolve();
                                });
                        });
                }
        }]);

        return Css;
}();

module.exports = new Css();
//# sourceMappingURL=css.js.map