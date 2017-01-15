var parsersHelper = require("../../utils/parsersHelper");
var _ = require('underscore')._;
module.exports = {

        parse: function (node) {

                var newNode = { name: "", type: "", value: "", visibility: "-", kind: "property" };

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
                                newNode.type = "module.exports";
                                newNode.visibility = "+"
                        }
                } else if (node.left.type === "Identifier") {
                        var LeftName = node.left.name
                }
                if (node.right.type === "Literal") {
                        newNode.group = "js-variable";
                        if (node.right.value === null) {
                                newNode.type = "Null"
                        } else {
                                newNode.type = typeof node.right.value
                        }
                        newNode.value = node.right.value
                } else if (node.right.type === "NewExpression") {
                        if (node.right.callee.type === "Identifier" && node.right.callee.name === "Array") {
                                newNode.group = "js-method-call";
                                newNode.type = "Array";
                                if (_.isUndefined(node.right.callee.name) || node.right.callee.name === null) {
                                        newNode.group = "unknown";
                                        newNode.name = node.right.callee.name
                                }
                        } else if (node.right.callee.type === "Identifier" && node.right.callee.name === "String") {
                                newNode.type = "String"
                        } else if (node.right.callee.type === "Identifier" && node.right.callee.name === "Number") {
                                newNode.type = "Number"
                        } else if (node.right.callee.type === "Identifier" && node.right.callee.name === "Boolean") {
                                newNode.type = "Boolean"
                        }
                } else if (node.right.type === "BinaryExpression") {
                        newNode.group = "js-variable";
                        newNode.type = "BinaryExpression"
                } else if (node.right.type === "MemberExpression") {
                        newNode.group = "js-object";
                        RightName = parsersHelper.getLeftName(node.right);
                        newNode.alias = RightName
                } else if (node.right.type === "Identifier") {
                        newNode.group = "js-variable";
                        RightName = node.right.name;
                        newNode.value = node.right.name;
                        newNode.type = "Identifier";
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

                newNode.name = LeftName;
                if (!_.isUndefined(node.left.object) && node.left.object.type === "ThisExpression") {
                        newNode.visibility = "public"
                }
                if (!_.isUndefined(node.right.arguments) && node.right.arguments.length > 0) {
                        if (node.right.arguments.length === 1) {
                                newNode.value = node.right.arguments[0].value
                        } else {
                                var rawValue = [];
                                _.each(node.right.arguments, function (argument) {
                                        if (!_.isUndefined(argument.name) && argument.name !== "") {
                                                rawValue.push(argument.name)
                                        } else if (!_.isUndefined(argument.value) && argument.value !== "") {
                                                rawValue.push(argument.value)
                                        }
                                });
                                if (rawValue !== "") {
                                        newNode.value = rawValue.join(", ")
                                }
                        }
                }
                if (!_.isUndefined(node.right.params)) {
                        var rawValue = [];
                        _.each(node.right.params, function (argument) {
                                if (!_.isUndefined(argument.name) && argument.name !== "") {
                                        rawValue.push(argument.name)
                                } else if (!_.isUndefined(argument.value) && argument.value !== "") {
                                        rawValue.push(argument.value)
                                }
                        });
                        if (rawValue.length > 0) {
                                newNode.value = rawValue.join(", ")
                        } else {
                                newNode.value = ""
                        }
                }

 




                if (newNode.group === "js-variable") {
                        if (newNode.type === "") {
                                newNode.type = "variable"
                        }
                }



                if (newNode.group === "js-object") {
                        newNode.type = "object"
                        newNode.visibility = "public";
                }


                if (newNode.group === "js-array") {
                        newNode.type = "array";
                }

                if (newNode.group === "js-function") {
                        newNode.kind = "method";

                        if (newNode.value === "undefined"){
                                newNode.value = "";
                        }

                }

                if (newNode.value === undefined){
                        newNode.value = "";
                }
                

                newNode.type = newNode.type.toLowerCase();


                return newNode;
        }

}