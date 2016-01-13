var    _ = require('underscore')._;
var parsersHelper = require("../parsersHelper");


//var db = require("../../deps/database.js");
//var Call = require("../../models/call.js");



module.exports = [ {	
                        type: "ast",
                        id: "Object method call",                      
                        analysis: "function2file",
                        description: "obj.func()",
                        active: true,
                        query:{type:"CallExpression"},
                        group: function(node,parent){
                            if(node.callee && node.callee.name === "require"){
                                return "require";
                            }
                            else if(node.callee && node.callee.name === "define"){
                                return "js-define";
                            }
                            else{
                                return "js-method-call";
                            }
                        }, 
                        loc: function(node,parent){
                            return JSON.stringify(node.loc);
                        },
                        rawValue: function(node,parent){
                            var rawValue = [];
                            _.each(node.arguments,function(param){


                                switch(param.type){
                                    case "Identifier":
                                        rawValue.push(param.name); 
                                    break;
                                    case "Literal":
                                        rawValue.push("'"+param.value+"'"); 


                                    break;
                                    default:
                                        rawValue.push(param.type); 
                                    break;
                                }
                            });

                            if(rawValue.length>0){
                                return rawValue.join(", ");
                            }
                            else{
                                return "";
                            }
                        },                    
                        parse: function(node,parent){
                            var newNode = {};
                            switch(node.callee.type){
                                case "Identifier":
                                    newNode.rawName = node.callee.name;
                                    newNode.name = parent.name+"::"+newNode.rawName+"::"+parsersHelper.getCount("call");

                                break;
                                case"MemberExpression":



                                    newNode.type = "member";

                                    var LeftName = parsersHelper.getLeftName(node.callee);

                                    if(node.callee.object &&  node.callee.object.type && node.callee.object.type === "ThisExpression"){
                                       
                                        
                                       LeftName = "this."+LeftName;
                                      
                                    }
                                    newNode.name = parent.name+"::"+LeftName+"::"+parsersHelper.getCount("call");
                                    newNode.rawName = LeftName;
                                break;
                                case "FunctionExpression":

                                    
                                    if(node.callee && node.callee.id === null){
                                        newNode.group = "js-anonymous-function";
                                        newNode.rawName = "anonymous-function";
                                        newNode.name = parent.name+"::scopeFunc::"+parsersHelper.getCount("call");
                                    }
                                    else{
                                        newNode.group = "unknown";
                                        newNode.rawName = node.callee.id.name;
                                        newNode.name = parent.name+"::"+newNode.rawName+"::"+parsersHelper.getCount("call");
                                    }
                                    
                                    
                                    
                                break;
                                case "LogicalExpression":
                                    newNode.group = "unknown";
                                    newNode.rawName = "unknown"; 
                                    newNode.name  = parent.name+"::"+"unknown"+parsersHelper.getCount("call");;
                                break;
                                default:
                                    newNode.name  = parent.name+"::"+"unknown"+parsersHelper.getCount("call");;
                                    newNode.rawName = "unknown"; 
                                    newNode.group = "unknown";
                                    
                                break;

                            }

                            if(newNode.rawName === "require"){
                               newNode.name = "";
                                 newNode.rawName = "";
                            }

                            return newNode;
                        }
                    },
                    {   
                        type: "ast",
                        id: "New Expression call",
                        description: "func()",
                        analysis: "function2file",
                        active: true,
                        query:{"type": "NewExpression"},
                        group: "js-method-call",
                        loc: function(node,parent){
                            return JSON.stringify(node.loc);
                        },
                        parse: function(node,parent){
                            var newNode = {};

                            switch(node.callee.type){
                                case "Identifier":
                                    newNode.rawName = node.callee.name;
                                    newNode.name = parent.name+"::"+newNode.rawName+"::"+parsersHelper.getCount("call");

                                break;
                                case"MemberExpression":

                                    newNode.type = "member";
                                    var LeftName = parsersHelper.getLeftName(node.callee);
                                    newNode.name = parent.name+"::"+LeftName+"::"+parsersHelper.getCount("call");
                                    newNode.rawName = LeftName;

                                break;
                                default:
                                    newNode.group = "unknown";
                                    newNode.rawName = "unknown";
                                    newNode.name = parent.name+"::unknown::"+parsersHelper.getCount("call");
                                break;

                            }
                            return newNode;
                        }
                    }

                    ];



