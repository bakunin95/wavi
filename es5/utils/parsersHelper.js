'use strict';

var _ = require('underscore')._,
    path = require('path');
var async = require("async");

var parsersHelper = module.exports = {
        counter: {},
        getFirstDefinedArray: function getFirstDefinedArray(AST, list) {
                var Defined = "";
                var candidate = null;
                _.each(list, function (filter) {
                        var currentFilter = filter.split(".");
                        if (!_.isUndefined(AST[currentFilter[0]])) {
                                candidate = AST[currentFilter[0]];
                        } else {
                                return false;
                        }
                        var n = 1;
                        if (currentFilter.length > 1) {
                                while (n !== currentFilter.length) {
                                        if (!_.isUndefined(candidate[currentFilter[n]])) {
                                                candidate = candidate[currentFilter[n]];
                                        } else {
                                                break;
                                        }
                                        n++;
                                }
                        }
                        if (n == currentFilter.length) {
                                Defined = candidate;
                        }
                });
                return Defined;
        },
        getCount: function getCount(counterName) {
                if (_.isUndefined(parsersHelper.counter[counterName])) {
                        parsersHelper.counter[counterName] = 1;
                } else {
                        parsersHelper.counter[counterName]++;
                }
                return counterName + ">" + parsersHelper.counter[counterName];
        },
        findFirstExistingAttr: function findFirstExistingAttr(elem, attrs) {
                var name = "";
                _.each(attrs, function (attr) {
                        if (!_.isUndefined(elem.attr(attr))) {
                                name = elem.attr(attr);
                                return;
                        }
                });
                return name;
        },
        correctPathSync: function correctPathSync(filePath, parent) {
                if (parent.folder === null || _.isUndefined(filePath) || _.isUndefined(parent.folder) || filePath.substring(0, 7) == "mailto:" || filePath.substring(0, 7) == "http://" || filePath.substring(0, 8) == "https://") {
                        return filePath;
                } else if (filePath === "..") {

                        var mixedPath = path.normalize(parent.folder + "../index.js");
                        mixedPath = mixedPath.replace(/\\/g, "\/").replace("//", "/");

                        return mixedPath;
                } else if (filePath.slice(-3) === "/..") {

                        filePath = filePath + "/index.js";
                        var mixedPath = path.normalize(parent.folder + "/" + filePath);
                        mixedPath = mixedPath.replace(/\\/g, "\/").replace("//", "/");

                        return mixedPath;
                } else {
                        var mixedPath = path.normalize(parent.folder + "/" + filePath);
                        mixedPath = mixedPath.replace(/\\/g, "\/").replace("//", "/");
                        return mixedPath;
                }
        },
        getLeftName: function getLeftName(node) {
                var name = void 0;
                function getLeftNameB(name, node) {

                        if (node.type === "Identifier") {
                                var name = node.name + "." + name;
                        } else if (node.type === "ThisExpression") {
                                var name = name;
                        } else if (node.type === "BinaryExpression") {
                                var name = "";
                        } else if (_.isUndefined(node.property)) {
                                var name = node.name + "." + name;
                        } else if (node.property.type === "Literal") {
                                var name = "[" + node.property.value + "]" + "." + name;
                        } else {

                                var name = node.property.name + "." + name;
                        }

                        if (node.object) {
                                return getLeftNameB(name, node.object);
                        }

                        if (name.slice(-4) === "[?].") {
                                name = name.slice(0, -1);
                        }

                        return name.replace('undefined.', '');
                }

                if (node.object && node.object.type === "BinaryExpression") {

                        if (node.property.type === "Identifier") {
                                return node.property.name;
                        } else {
                                return name;
                        }
                }

                if (node.object) {
                        if (node.property.type !== "Identifier" || _.isUndefined(node.property.name)) {
                                return getLeftNameB("[?].", node.object);
                        } else {
                                return getLeftNameB(node.property.name, node.object);
                        }
                }

                return name;
        },
        getAlias: function getAlias(result, node) {

                var result = { name: [], value: "" };

                function getLeftNameB(result, node) {

                        if (node.left) {

                                if (node.left.type === "Identifier") {
                                        result.name.push(node.left.name);
                                }
                        }
                        if (node.right) {
                                return getLeftNameB(result, node.right);
                        } else {
                                result.value = node;
                                return result;
                        }
                }

                if (node.right) {
                        return getLeftNameB(result, node);
                }

                return result;
        },
        reduceLength: function reduceLength(name, maxLength) {
                if (typeof name == "string" && name.length > maxLength) {
                        return name.substr(0, maxLength) + "...";
                } else {
                        return name;
                }
        },
        removeSpecialChar: function removeSpecialChar(str) {
                if (str !== null && typeof str === "string" && !_.isUndefined(str)) {
                        str = str.replace(/\\n/g, "\\n").replace(/\\'/g, "\\'").replace(/\\l/g, "\\n").replace(/\\"/g, '\\"').replace(/\\&/g, "\\&").replace(/\\r/g, "\\r").replace(/\\t/g, "\\t").replace(/\\b/g, "\\b").replace(/\\f/g, "\\f").replace(/\\\//g, "/").replace(".prototype.", ".").replace(/([^\x00-\xFF]|\s)*$/g, '').replace(/(\r\n|\n|\r)/gm, "").replace(/[`~!@#$%^&*()_|=?;'"\{\}<>\\\/]/gi, '').replace("[]", "[?]");
                        //
                        //.replace(/\W/g, '');
                }
                return str;
        },
        getPrototypeVar: function getPrototypeVar(LeftName) {
                var LeftNameArr = LeftName.split(".");

                var flag = 0;
                var key = [];
                var name = [];
                _.each(LeftNameArr, function (token) {
                        if (token === "prototype") {
                                flag = 1;
                        } else {
                                if (flag === 0) {
                                        key.push(token);
                                } else {
                                        name.push(token);
                                }
                        }
                });
                return [key.join("."), name.join(".")];
        },
        getParams: function getParams(params) {
                var rawValue = [];
                _.each(params, function (param) {
                        if (param.type === "Identifier" && !_.isUndefined(param.name)) {
                                rawValue.push(param.name);
                        }
                });

                if (rawValue.length > 0) {
                        return rawValue.join(", ");
                } else {
                        return "";
                }
        },
        getAjaxUrl: function getAjaxUrl(properties, node, cb) {
                var url = null;
                async.each(properties, function (property, cbRel) {
                        if (!_.isUndefined(property.key) && !_.isUndefined(property.value) && property.key.type == "Identifier") {
                                if (property.value.type === "Literal" || property.value.type === "Identifier") {
                                        if (property.key.name == "url") {
                                                url = property.value.value;
                                                var temp = node.rootParent.split("/");
                                                if (temp.length > 0) {
                                                        temp = temp.slice(0, temp.length - 2).join("/");
                                                }

                                                // console.log("proerty.value.value",property.value.value);

                                                url = parsersHelper.correctPathSync(property.value.value, { folder: temp });

                                                //console.log("url",url);
                                        }
                                }
                        }
                        cbRel();
                }, function () {
                        cb(url);
                });
        }
};
//# sourceMappingURL=parsersHelper.js.map