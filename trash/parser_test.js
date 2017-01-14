//wavia


var parsersHelper = require("../parsersHelper");
var _ = require("underscore")._;
module.exports = [{
    type: "ast",
    id: "assigmentExpression",
    description: "a = b",
    analysis: "function2file",
    active: true,
    query: {
        type: "AssignmentExpression"
    },
    group: "js-function",
    loc: function(node, parent) {
        return JSON.stringify(node.loc)
    },
    parse: function(node, parent) {
        var newNode = {};
        newNode.data = JSON.stringify(node);
        var LeftName = "";
        var RightName = "";
        if (node.left.type === "MemberExpression") {
            var LeftName = parsersHelper.getLeftName(node.left);
            if (node.left.object && node.left.object.type === "Identifier" && node.left.object.name === "exports") {
                var tempName = LeftName.split(".");
                tempName.shift();
                LeftName = tempName.join(".");
                newNode.visibility = "+"
            }
            if (node.left.object.type === "Identifier" && node.left.object.name === "module" && node.left.property.type === "Identifier" && node.left.property.name === "exports") {
                var tempName = LeftName.split(".");
                tempName.shift();
                newNode.rawType = "module.exports";
                newNode.visibility = "+"
            }
        } else if (node.left.type === "Identifier") {
            var LeftName = node.left.name
        }
        if (node.right.type === "Literal") {
            newNode.group = "js-variable";
            if (node.right.value === null) {
                newNode.rawType = "Null"
            } else {
                newNode.rawType = typeof node.right.value
            }
            newNode.rawValue = node.right.value
        } else if (node.right.type === "NewExpression") {
            if (node.right.callee.type === "Identifier" && node.right.callee.name === "Array") {
                newNode.group = "js-method-call";
                newNode.rawType = "Array";
                if (_.isUndefined(node.right.callee.name) || node.right.callee.name === null) {
                    newNode.group = "unknown";
                    newNode.rawName = node.right.callee.name
                }
            } else if (node.right.callee.type === "Identifier" && node.right.callee.name === "String") {
                newNode.rawType = "String"
            } else if (node.right.callee.type === "Identifier" && node.right.callee.name === "Number") {
                newNode.rawType = "Number"
            } else if (node.right.callee.type === "Identifier" && node.right.callee.name === "Boolean") {
                newNode.rawType = "Boolean"
            }
        } else if (node.right.type === "BinaryExpression") {
            newNode.group = "js-variable";
            newNode.rawType = "BinaryExpression"
        } else if (node.right.type === "MemberExpression") {
            newNode.group = "js-object";
            RightName = parsersHelper.getLeftName(node.right);
            newNode.alias = RightName
        } else if (node.right.type === "Identifier") {
            newNode.group = "js-variable";
            RightName = node.right.name;
            newNode.rawValue = node.right.name;
            newNode.rawType = "Identifier";
            newNode.alias = RightName
        } else if (node.right.type === "CallExpression" || node.right.type === "NewExpression") {
            newNode.group = "js-function";
            if (node.right.callee.type === "MemberExpression") {
                RightName = parsersHelper.getLeftName(node.right.callee);
                newNode.alias = RightName
            } else if (node.right.callee.type === "Identifier") {
                RightName = node.right.callee.name;
                newNode.alias = RightName
            }
        }
        newNode.name = parent.name + "::" + LeftName;
        newNode.rawName = LeftName;
        if (!_.isUndefined(node.left.object) && node.left.object.type === "ThisExpression") {
            newNode.visibility = "+"
        }
        if (!_.isUndefined(node.right.arguments) && node.right.arguments.length > 0) {
            if (node.right.arguments.length === 1) {
                newNode.rawValue = node.right.arguments[0].value
            } else {
                var rawValue = [];
                _.each(node.right.arguments, function(arguments) {
                    if (!_.isUndefined(arguments.name) && arguments.name !== "") {
                        rawValue.push(arguments.name)
                    } else if (!_.isUndefined(arguments.value) && arguments.value !== "") {
                        rawValue.push(arguments.value)
                    }
                });
                if (rawValue !== "") {
                    newNode.rawValue = rawValue.join(", ")
                }
            }
        }
        if (!_.isUndefined(node.right.params)) {
            var rawValue = [];
            _.each(node.right.params, function(arguments) {
                if (!_.isUndefined(arguments.name) && arguments.name !== "") {
                    rawValue.push(arguments.name)
                } else if (!_.isUndefined(arguments.value) && arguments.value !== "") {
                    rawValue.push(arguments.value)
                }
            });
            if (rawValue.length > 0) {
                newNode.rawValue = rawValue.join(", ")
            } else {
                newNode.rawValue = ""
            }
        }
        if (!_.isUndefined(newNode) && !_.isUndefined(newNode.rawValue)) {
            var test = newNode.rawValue + "";
            test.replace(" ", "");
            test.replace(",", "");
            if (test === "undefined" || _.isUndefined(test) || !_.isUndefined(test) && test === "") {
                newNode.rawValue = ""
            }
        }
        return newNode
    },
    after: function(node, parent, cb) {
        var data = JSON.parse(node.data);
        if (parent.rawName === "constructor") {
            parsersHelper.reasignParent(node, parent, function() {
                cb()
            })
        } else if (data.left && data.left.object && data.left.object.property && data.left.object.property.name === "prototype") {
            var LeftName = parsersHelper.getLeftName(data.left);
            var protoVar = parsersHelper.getPrototypeVar(LeftName);
            node.rawName = protoVar[1];
            node.save(cb)
        } else {
            setImmediate(cb)
        }
    }
}, {
    type: "ast",
    id: "ExpressionStatement1",
    description: "",
    analysis: "object2file",
    active: true,
    query: {
        type: "ExpressionStatement",
        expression: {
            type: "Identifier"
        }
    },
    group: "js-variable",
    parse: function(node, parent) {
        var newNode = {};
        var name = node.expression.name;
        newNode.name = parent.name + "::" + name;
        newNode.rawName = name;
        return newNode
    },
    rawType: "Undefined"
}];


var parsersHelper = require("../parsersHelper");
var _ = require("underscore")._;
module.exports = [{
    type: "ast",
    id: "initStatement",
    analysis: "variable",
    description: "var a = call();",
    active: true,
    query: {
        type: "VariableDeclarator",
        id: {
            type: "Identifier"
        }
    },
    group: "js-function",
    loc: function(node, parent) {
        return JSON.stringify(node.loc)
    },
    rawName: ["id.name"],
    parse: function(node, parent) {
        var newNode = {};
        newNode.data = JSON.stringify(node);
        newNode.name = parent.name + "::" + node.id.name;
        if (node.init !== null && node.init.name !== null) {
            newNode.alias = node.init.name
        }
        if (node.init !== null && node.init.type === "CallExpression" && node.init.callee.name !== null) {
            newNode.alias = node.init.callee.name
        }
        newNode.rawType = "variable";
        if (node.init !== null) {
            switch (node.init.type) {
                case "FunctionExpression":
                    newNode.group = "js-function";
                    break;
                case "CallExpression":
                    newNode.group = "js-function";
                    if (node.init.callee.name === "require") {
                        newNode.name = parent.name + "::" + node.id.name + "::" + parsersHelper.getCount("require");
                        newNode.group = "unknown";
                        if (!_.isUndefined(node.init) && node.init !== null && !_.isUndefined(node.init.arguments)) {
                            newNode.rawName = parsersHelper.correctPathSync(node.init.arguments[0].value, parent);
                            newNode.alias = node.id.name
                        }
                        var rawValue = [];
                        _.each(node.init.arguments, function(param) {
                            rawValue.push(param.type)
                        });
                        if (rawValue.length > 0) {
                            newNode.rawValue = rawValue.join(", ")
                        }
                    }
                    break;
                case "ObjectExpression":
                    newNode.group = "js-object";
                    newNode.alias = node.init.name;
                    break;
                case "MemberExpression":
                    newNode.group = "js-object";
                    if (node.right && node.right.callee) {
                        if (node.right.callee.type === "Identifier" && node.right.callee.name === "Array") {
                            newNode.group = "js-array";
                            newNode.rawType = "array"
                        } else if (node.right.callee.type === "Identifier" && node.right.callee.name === "String") {
                            newNode.group = "js-variable";
                            newNode.rawType = "string"
                        } else if (node.right.callee.type === "Identifier" && node.right.callee.name === "Number") {
                            newNode.group = "js-variable";
                            newNode.rawType = "number"
                        } else if (node.right.callee.type === "Identifier" && node.right.callee.name === "Boolean") {
                            newNode.group = "js-variable";
                            newNode.rawType = "boolean"
                        }
                    } else if (node.init.property && node.init.property.type && node.init.property.type === "Identifier") {
                        newNode.alias = node.init.property.name
                    }
                    break;
                case "ArrayExpression":
                    newNode.group = "js-array";
                    break;
                case "NewExpression":
                    newNode.group = "js-function";
                    newNode.rawName = node.name;
                    if (_.isUndefined(node.init.callee.name) || node.init.callee.name === null) {
                        newNode.group = "unknown"
                    }
                    newNode.alias = node.init.callee.name;
                    newNode.newExp = node.init.callee.name;
                    if (node.init.callee.type === "Identifier" && node.init.callee.name === "Array") {
                        newNode.group = "js-array";
                        newNode.rawType = "array"
                    } else if (node.init.callee.type === "Identifier" && node.init.callee.name === "String") {
                        newNode.group = "js-variable";
                        newNode.rawType = "string"
                    } else if (node.init.callee.type === "Identifier" && node.init.callee.name === "Number") {
                        newNode.group = "js-variable";
                        newNode.rawType = "number"
                    } else if (node.init.callee.type === "Identifier" && node.init.callee.name === "Boolean") {
                        newNode.group = "js-variable";
                        newNode.rawType = "boolean"
                    }
                    break;
                case "Literal":
                    newNode.group = "js-variable";
                    newNode.rawType = typeof node.init.value;
                    if (node.init.value === null) {
                        newNode.rawType = "null"
                    }
                    if (typeof node.init.value === "object") {
                        newNode.rawValue = undefined
                    } else {
                        newNode.rawValue = node.init.value
                    }
                    break;
                case "Identifier":
                    newNode.group = "js-variable";
                    newNode.alias = node.init.name;
                    newNode.rawValue = node.init.name;
                    break;
                case "AssignmentExpression":
                    var Alias = parsersHelper.getAlias([], node.init);
                    switch (Alias.value.type) {
                        case "FunctionExpression":
                            newNode.group = "js-function";
                            break;
                        case "CallExpression":
                            newNode.group = "js-function";
                            break;
                        case "ObjectExpression":
                            newNode.group = "js-object";
                            break;
                        case "MemberExpression":
                            newNode.group = "js-object";
                            break;
                        case "ArrayExpression":
                            newNode.group = "js-array";
                            break;
                        default:
                            newNode.group = "js-variable"
                    }
                    newNode.name = parent.name + "::" + node.id.name;
                    newNode.alias = Alias.name;
                    break;
                default:
                    newNode.group = "js-variable"
            }
        } else {
            newNode.group = "js-variable";
            newNode.rawValue = null
        }
        if (node.init === null || _.isUndefined(node.init)) {
            newNode.rawValue = "undefined"
        } else if (!_.isUndefined(node.init.arguments)) {
            var rawValue = [];
            _.each(node.init.arguments, function(arguments) {
                if (!_.isUndefined(arguments.name) && arguments.name !== "") {
                    rawValue.push(arguments.name)
                } else if (!_.isUndefined(arguments.value) && arguments.value !== "") {
                    rawValue.push(arguments.value)
                }
            });
            if (rawValue.length > 0) {
                newNode.rawValue = rawValue.join(", ")
            } else {
                newNode.rawValue = ""
            }
        } else if (!_.isUndefined(node.init.params)) {
            var rawValue = [];
            _.each(node.init.params, function(arguments) {
                if (!_.isUndefined(arguments.name) && arguments.name !== "") {
                    rawValue.push(arguments.name)
                } else if (!_.isUndefined(arguments.value) && arguments.value !== "") {
                    rawValue.push(arguments.value)
                }
            });
            if (rawValue.length > 0) {
                newNode.rawValue = rawValue.join(", ")
            } else {
                newNode.rawValue = ""
            }
        }
        return newNode
    }
}];

var parsersHelper = require("../parsersHelper");
var esquery = require("esquery");
var _ = require("underscore")._;
var async = require("async");
module.exports = [{
    type: "ast",
    id: "FunctionDeclaration",
    description: "function func(){}",
    analysis: "function2file",
    active: true,
    query: {
        type: "FunctionDeclaration",
        id: {
            type: "Identifier"
        }
    },
    group: "js-function",
    loc: function(node, parent) {
        return JSON.stringify(node.loc)
    },
    name: function(node, parent) {
        return parent.name + "::" + node.id.name
    },
    parse: function(node, parent) {
        var newNode = {};
        try {
            var matches = esquery(node, '[type="Identifier"][name="arguments"]')
        } catch (e) {
            var matches = []
        }
        if (matches.length > 0) {
            newNode.type = "args"
        }
        return newNode
    },
    rawName: ["id.name"],
    rawValue: function(node, parent) {
        var rawValue = [];
        _.each(node.params, function(param) {
            rawValue.push(param.name)
        });
        if (rawValue.length > 0) {
            return rawValue.join(", ")
        } else {
            return ""
        }
    }
}, {
    type: "ast",
    id: "FunctionAssignment",
    analysis: "function2file",
    description: "myVar: function(){}",
    active: true,
    query: {
        type: "Property",
        key: {
            type: "Identifier"
        }
    },
    loc: function(node, parent) {
        return JSON.stringify(node.loc)
    },
    visibility: "+",
    name: function(node, parent) {
        return parent.name + "::" + node.key.name
    },
    rawName: ["key.name"],
    parse: function(node, parent) {
        var newNode = {};
        newNode.group = "js-variable";
        try {
            var matches = esquery(node, '[type="Identifier"][name="arguments"]')
        } catch (e) {
            var matches = []
        }
        if (matches.length > 0) {
            newNode.type = "args"
        }
        switch (node.value.type) {
            case "FunctionExpression":
                newNode.group = "js-function";
                newNode.name = parent.name + "::" + node.key.name;
                newNode.rawName = node.key.name;
                var rawValue = [];
                _.each(node.value.params, function(param) {
                    if (param.type === "Identifier" && !_.isUndefined(param.name)) {
                        rawValue.push(param.name)
                    }
                });
                if (rawValue.length > 0) {
                    newNode.rawValue = rawValue.join(", ")
                } else {
                    newNode.rawValue = ""
                }
                break;
            case "Identifier":
                newNode.group = "js-variable";
                newNode.rawValue = node.value.name;
                newNode.rawType = typeof node.value.name;
                break;
            case "Literal":
                newNode.group = "js-variable";
                newNode.rawValue = node.value.value;
                if (node.value.value === null) {
                    newNode.rawType = "Null"
                } else {
                    newNode.rawType = typeof node.value.value
                }
                break;
            case "BinaryExpression":
                newNode.group = "js-variable";
                newNode.rawValue = "";
                newNode.rawType = "variable";
                break;
            case "ArrayExpression":
                newNode.group = "js-array";
                newNode.rawValue = "";
                newNode.rawType = "Array";
                break;
            case "ObjectExpression":
                newNode.group = "js-object";
                var name = parsersHelper.getFirstDefinedArray(node, ["key.name"]);
                if (name === "") {
                    name = "undefined"
                }
                newNode.name = parent.name + "::" + name;
                newNode.rawValue = "";
                newNode.rawType = "Object";
                break;
            case "LogicalExpression":
                newNode.group = "js-variable";
                newNode.rawValue = "";
                newNode.rawType = "LogicalExpression";
                break
        }
        return newNode
    }
}];