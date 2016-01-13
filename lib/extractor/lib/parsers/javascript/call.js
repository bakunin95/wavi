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
//console.log("##ARGS",node.arguments);
                            _.each(node.arguments,function(param){


                                switch(param.type){
                                    //case "FunctionExpression":
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


                               // rawValue.push(param.name);  //param.type
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
                        	//newNode.data = JSON.stringify(node);
                        
                           // console.log(node.callee.type);
							
//console.log(node);
                            

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
                                    /*var LeftName = parsersHelper.getLeftName(node.callee);
                                    newNode.name = parent.name+"::"+LeftName+"::"+parsersHelper.getCount("call");
                                    newNode.rawName = LeftName;
                                    console.log(LeftName+"@"+node.loc.start.line);*/


                                    newNode.group = "unknown";
                                    newNode.rawName = "unknown"; 
                                    newNode.name  = parent.name+"::"+"unknown"+parsersHelper.getCount("call");;
                                break;
//ConditionalExpression
                               /* case "newExpression":
                                    if(node.callee.type === "Identifier"){

                                    }
                                    newNode.group = "unknown";
                                    newNode.rawName = "unknown"; 
                                    newNode.name  = parent.name+"::"+"unknown"+parsersHelper.getCount("call");;
                                    
                                break;*/
                                default:
                                     /*
                                    var LeftName = parsersHelper.getLeftName(node.callee);
                                    newNode.name = parent.name+"::"+LeftName+"::"+parsersHelper.getCount("call");
                                    newNode.rawName = LeftName;*/
                                   //console.log("###"+node.callee.type);
                                 //  console.log("###",node.callee);

                                    newNode.name  = parent.name+"::"+"unknown"+parsersHelper.getCount("call");;
                                    newNode.rawName = "unknown"; 
                                    newNode.group = "unknown";
                                    console.log("#### UNCATCHED CallExp",node.callee.type);
                                break;

                            }

                            if(newNode.rawName === "require"){
                               newNode.name = "";
                                 newNode.rawName = "";
                            }


                            //newNode.rawValue = call;


                            return newNode;
                        } /*,
                       after: function(node,parent,cb){
                            var data = JSON.parse(node.data);


                            

                            if(data.callee && data.callee.property && data.arguments && data.arguments.length === 2 && data.arguments[0].type === "Identifier" &&
                                data.arguments[1].type === "Identifier" && data.callee.property.name === "extend"){
                                var LeftName = parsersHelper.getLeftName(data.left);
                                 var protoVar = parsersHelper.getPrototypeVar(LeftName);

                                 console.log("proto",protoVar);


                                 node.rawName = protoVar[1];





                               // parsersHelper.addExtend(node,parent,[data.arguments[0].name,data.arguments[1].name],{},function(){  
                                    //node.save(cb);
                                    cb();   
                               // });

                                

                               

                               
                            }
                            else{
                                cb();
                            }

                        }*/
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
                               // console.log("#### UNCATCHED NewExp");
                                break;

                            }
                            return newNode;
                        }
                    }

                    ];



