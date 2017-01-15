"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _ = require('underscore')._;
module.exports = {

        parse: function parse(node) {

                var newNode = { name: "", type: "", value: "", visibility: "-", kind: "property" };

                if (node.id.type === "Identifier") {
                        newNode.name = node.id.name;
                }
                if (node.init !== null) {
                        switch (node.init.type) {
                                case "FunctionExpression":
                                        newNode.group = "js-function";
                                        break;
                                case "ObjectExpression":
                                        newNode.group = "js-object";
                                        newNode.rawType = "object";
                                        break;
                                case "MemberExpression":
                                        newNode.group = "js-object";
                                        if (node.right && node.right.callee) {
                                                if (node.right.callee.type === "Identifier" && node.right.callee.name === "Array") {
                                                        newNode.group = "js-array";
                                                        newNode.rawType = "array";
                                                } else if (node.right.callee.type === "Identifier" && node.right.callee.name === "String") {
                                                        newNode.group = "js-variable";
                                                        newNode.rawType = "string";
                                                } else if (node.right.callee.type === "Identifier" && node.right.callee.name === "Number") {
                                                        newNode.group = "js-variable";
                                                        newNode.rawType = "number";
                                                } else if (node.right.callee.type === "Identifier" && node.right.callee.name === "Boolean") {
                                                        newNode.group = "js-variable";
                                                        newNode.rawType = "boolean";
                                                }
                                        }
                                        break;
                                case "ArrayExpression":
                                        newNode.group = "js-array";
                                        break;
                                case "NewExpression":
                                        newNode.group = "js-function";
                                        newNode.name = node.name;
                                        if (_.isUndefined(node.init.callee.name) || node.init.callee.name === null) {
                                                newNode.group = "unknown";
                                        }
                                        newNode.newExp = node.init.callee.name;
                                        if (node.init.callee.type === "Identifier" && node.init.callee.name === "Array") {
                                                newNode.group = "js-array";
                                                newNode.rawType = "array";
                                        } else if (node.init.callee.type === "Identifier" && node.init.callee.name === "String") {
                                                newNode.group = "js-variable";
                                                newNode.rawType = "string";
                                        } else if (node.init.callee.type === "Identifier" && node.init.callee.name === "Number") {
                                                newNode.group = "js-variable";
                                                newNode.rawType = "number";
                                        } else if (node.init.callee.type === "Identifier" && node.init.callee.name === "Boolean") {
                                                newNode.group = "js-variable";
                                                newNode.rawType = "boolean";
                                        }
                                        break;
                                case "Literal":
                                        newNode.group = "js-variable";
                                        newNode.rawType = _typeof(node.init.value);
                                        if (node.init.value === null) {
                                                newNode.rawType = "null";
                                        }
                                        if (_typeof(node.init.value) === "object") {
                                                // newNode.value = undefined
                                        } else {
                                                        newNode.value = node.init.value;
                                                }
                                        break;
                                case "Identifier":
                                        newNode.group = "js-variable";
                                        newNode.value = node.init.name;
                                        break;
                                default:
                                        newNode.group = "js-variable";
                        }
                }
                if (node.init === null || _.isUndefined(node.init)) {
                        newNode.value = "undefined";
                } else if (!_.isUndefined(node.init.arguments)) {
                        var rawValue = [];
                        _.each(node.init.arguments, function (args) {
                                if (!_.isUndefined(args.name) && args.name !== "") {
                                        rawValue.push(args.name);
                                } else if (!_.isUndefined(args.value) && args.value !== "") {
                                        rawValue.push(args.value);
                                }
                        });
                        if (rawValue.length > 0) {
                                newNode.value = rawValue.join(", ");
                        } else {
                                newNode.value = "";
                        }
                } else if (!_.isUndefined(node.init.params)) {
                        var rawValue = [];
                        _.each(node.init.params, function (args) {
                                if (!_.isUndefined(args.name) && args.name !== "") {
                                        rawValue.push(args.name);
                                } else if (!_.isUndefined(args.value) && args.value !== "") {
                                        rawValue.push(args.value);
                                }
                        });
                        if (rawValue.length > 0) {
                                newNode.value = rawValue.join(", ");
                        } else {
                                newNode.value = "";
                        }
                }

                if (newNode.group === "js-variable") {
                        if (newNode.type === "") {
                                newNode.type = "variable";
                        }
                }

                if (newNode.group === "js-object") {
                        newNode.type = "object";
                }

                if (newNode.group === "js-array") {
                        newNode.type = "array";
                }

                if (newNode.group === "js-function") {
                        newNode.kind = "method";
                }

                newNode.type = newNode.type.toLowerCase();

                return newNode;
        }

};
//# sourceMappingURL=initStatement.js.map