var parsersHelper = require("../parsersHelper");
var esquery = require("esquery");
var _ = require('underscore')._;
var async = require('async');

module.exports = [ {	
                        type: "ast",
                        id: "FunctionDeclaration",
                        description: "function func(){}",
                        analysis: "function2file",
                        active: true,
                        query:{type:"FunctionDeclaration",id:{type:"Identifier"}},
                        group: "js-function",
                        loc: function(node,parent){
                            return JSON.stringify(node.loc);
                        },
                        name: function(node,parent){
                            return parent.name+"::"+node.id.name;
                        },
                        parse: function(node,parent){
                            var newNode = {};
                            try{
                                var matches = esquery(node, '[type="Identifier"][name="arguments"]');
                            }catch(e){
                                var matches = [];
                            }
                            if(matches.length > 0 ){
                             newNode.type = "args";
                            }   

                            return newNode;
                        },
                        rawName: ['id.name'],
                        rawValue: function(node,parent){
                            var rawValue = [];
                            _.each(node.params,function(param){       
                                rawValue.push(param.name);
                            });
                            if(rawValue.length>0){
                                return rawValue.join(", ");
                            }
                            else{
                                return "";
                            } 
                        },
                    },
                    {
                        type: "ast", 
                        id: "FunctionAssignment",
                        analysis: "function2file",
                        description: "myVar: function(){}",
                        active: true,
                        query: {"type": "Property", "key": {"type": "Identifier"}},
                        loc: function(node,parent){
                            return JSON.stringify(node.loc);
                        },
                        visibility: "+",
                        name: function(node,parent){
                            return parent.name+"::"+node.key.name;
                        },
                        rawName: ['key.name'],
                        parse: function(node,parent){
                            var newNode = {};
                            newNode.group = "js-variable";
                            try{
                                var matches = esquery(node, '[type="Identifier"][name="arguments"]');
                            }catch(e){
                                var matches = [];
                            }
                            if(matches.length > 0 ){
                             newNode.type = "args";
                            }      
                            switch(node.value.type){
                                case "FunctionExpression":
                                    newNode.group = "js-function";
                                    newNode.name = parent.name+"::"+node.key.name;
                                    newNode.rawName = node.key.name;
                                     var rawValue = [];
                                    _.each(node.value.params,function(param){
                                        if(param.type === "Identifier" && !_.isUndefined(param.name)){
                                            rawValue.push(param.name);
                                        }
                                       
                                    });
                                    if(rawValue.length>0){
                                        newNode.rawValue =  rawValue.join(", ");
                                    }
                                    else{
                                        newNode.rawValue = "";
                                    }
                                break;
                                case "Identifier":
                                    newNode.group = "js-variable";
                                    newNode.rawValue = node.value.name;
                                    newNode.rawType = (typeof node.value.name);

                                break;
                                case "Literal":
                                    newNode.group = "js-variable";
                                    newNode.rawValue = node.value.value;
                                    if(node.value.value === null){
                                         newNode.rawType = "Null";
                                    }
                                    else{
                                        newNode.rawType = (typeof node.value.value);
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
                                    var name = parsersHelper.getFirstDefinedArray(node,["key.name"]);                             
                                    if(name === ""){
                                        name="undefined";
                                    }
                                    newNode.name = parent.name+"::"+name;

                                    newNode.rawValue = "";
                                    newNode.rawType = "Object";
                                break;
                                case "LogicalExpression":
                                    newNode.group = "js-variable";
                                    newNode.rawValue = "";
                                    newNode.rawType = "LogicalExpression";
                                break;

                            }
                        return newNode;

                        }
                    }];


