//var db = require("../../deps/database.js");
//var Def = require("../../models/def.js");
var parsersHelper = require("../parsersHelper");

var _ = require('underscore')._;

module.exports = [  {
                        type: "ast",
                        id: "assigmentExpression",
                        description: "a = b",
                        analysis: "function2file",
                        active: true,
                        query: {"type": "AssignmentExpression" },
                        group: "js-function",
                         loc: function(node,parent){
                            return JSON.stringify(node.loc);
                        },
                        parse: function(node,parent){
                            var newNode = {};



                           newNode.data = JSON.stringify(node);

                           
                            var LeftName = "";
                            var RightName = "";
                            if(node.left.type === "MemberExpression"){
                                var LeftName = parsersHelper.getLeftName(node.left);


                                if(node.left.object && node.left.object.type === "Identifier" && node.left.object.name === "exports"){
                                   
                                    var tempName = LeftName.split(".");
                                    tempName.shift();
                                

                                    LeftName = tempName.join(".");
                                    newNode.visibility = "+";
                                }
                                        
                                 if(node.left.object.type === "Identifier" && node.left.object.name === "module" && node.left.property.type === "Identifier" && node.left.property.name === "exports" ){
                                   
                                    var tempName = LeftName.split(".");
                                    tempName.shift();
                                

                                    newNode.rawType = "module.exports";
                                    newNode.visibility = "+";
                                }


                            }
                            else if(node.left.type === "Identifier"){
                                var LeftName = node.left.name;
                            }

                            if( node.right.type === "Literal"){
                                newNode.group = "js-variable";
                               if(node.right.value === null){
                                         newNode.rawType = "Null";
                               }
                               else{
                                    newNode.rawType = (typeof node.right.value);
                                   
                               }
                                 newNode.rawValue = node.right.value;
                            }
                            else if(node.right.type === "NewExpression"){
                                if(node.right.callee.type === "Identifier" && node.right.callee.name === "Array"){
                                            newNode.group = "js-method-call";
                                            newNode.rawType = "Array";

                                            if(_.isUndefined(node.right.callee.name) || node.right.callee.name === null){
                                                newNode.group = "unknown";
                                                newNode.rawName = node.right.callee.name;
                                            }

                                          //  newNode.rawValue = node.right.arguments[0].value
                                        }
                                        else if(node.right.callee.type === "Identifier" && node.right.callee.name === "String"){
                                        //    newNode.group = "js-variable";
                                            newNode.rawType = "String";
                                        }
                                        else if(node.right.callee.type === "Identifier" && node.right.callee.name === "Number"){
                                          //  newNode.group = "js-variable";
                                            newNode.rawType = "Number";
                                        }
                                        else if(node.right.callee.type === "Identifier" && node.right.callee.name === "Boolean"){
                                        //    newNode.group = "js-variable";
                                            newNode.rawType = "Boolean";
                                        }
                            }
                            else if(node.right.type === "BinaryExpression"){
                                newNode.group = "js-variable";
                                newNode.rawType = "BinaryExpression";
                            }
                            else if(node.right.type === "MemberExpression"){
                                newNode.group = "js-object";
                                RightName =parsersHelper.getLeftName(node.right);
                                newNode.alias = RightName;
                            }
                            else if(node.right.type === "Identifier"){
                                newNode.group = "js-variable";
                                RightName = node.right.name;
                                newNode.rawValue = node.right.name;
                                newNode.rawType = "Identifier";
                                newNode.alias = RightName;
                            }
                            else if(node.right.type ==="CallExpression" || node.right.type === "NewExpression"){
                                newNode.group = "js-function";
                                if(node.right.callee.type === "MemberExpression"){
                                    RightName = parsersHelper.getLeftName(node.right.callee);
                                    newNode.alias = RightName;
                                }
                                else if (node.right.callee.type === "Identifier"){
                                    RightName = node.right.callee.name;
                                    newNode.alias = RightName;
                                }
                            }

                            
                            newNode.name = parent.name+"::"+LeftName;
                            newNode.rawName = LeftName;


                             if(!_.isUndefined(node.left.object) && node.left.object.type === "ThisExpression"){



                                newNode.visibility = "+";
                            }

                           
                            if(!_.isUndefined(node.right.arguments) && node.right.arguments.length > 0){
                                if(node.right.arguments.length === 1){
                                    newNode.rawValue = node.right.arguments[0].value;

                                }
                                else{
                                    var rawValue = [];
                                    _.each(node.right.arguments,function(arguments){
                                        
                                         

                                         if(!_.isUndefined(arguments.name) && arguments.name !== ""){
                                            rawValue.push(arguments.name);
                                         }
                                         else if(!_.isUndefined(arguments.value) && arguments.value !== ""){
                                            rawValue.push(arguments.value);
                                         }

                                    });

                                    
                                    if(rawValue !== ""){
                                        newNode.rawValue = rawValue.join(", ");  
                                    }
                                    
                                }
                               
                
                            }


                             if(!_.isUndefined(node.right.params)){
                                var rawValue = [];
                                _.each(node.right.params,function(arguments){
                                    //rawValue.push(arguments.name);
                                     if(!_.isUndefined(arguments.name) && arguments.name !== ""){
                                        rawValue.push(arguments.name);
                                     }
                                     else if(!_.isUndefined(arguments.value) && arguments.value !== ""){
                                        rawValue.push(arguments.value);
                                     }
                                });
                                if(rawValue.length>0){
                                    newNode.rawValue = rawValue.join(", ");
                                }
                                else{
                                     newNode.rawValue = "";
                                }
                            }

                            if(!_.isUndefined(newNode) && !_.isUndefined(newNode.rawValue) ){
                                var test = newNode.rawValue+"";
                                test.replace(" ","");
                                test.replace(",","");
                                if(test === "undefined" || _.isUndefined(test)  || !_.isUndefined(test) && test === ""){
                                   newNode.rawValue = "";   
                                }


                                //&& (newNode.rawValue).replace(" ","").replace(",","") === ""

                              
                            }




                           /* if(node.right.type === "Literal"){
                                newNode.rawValue = node.right.value;
                            }*/


                            return newNode;
                        },
                        after: function(node,parent,cb){
                            var data = JSON.parse(node.data);

                            if(parent.rawName === "constructor"){
                                //console.log("### Yup its a variable",node);

                                parsersHelper.reasignParent(node,parent,function(){  
                                    cb();   
                                });
                            }
                            else if(data.left && data.left.object && data.left.object.property && data.left.object.property.name === "prototype"){
                                var LeftName = parsersHelper.getLeftName(data.left);
                                 var protoVar = parsersHelper.getPrototypeVar(LeftName);

                                


                                 node.rawName = protoVar[1];

                               // parsersHelper.addPrototype(node,parent,protoVar,{},function(){  
                                    node.save(cb);
                                    //cb();   
                               // });

                               
                            }
                            else{
                                setImmediate(cb);
                            }

                        }
                    },
                    {	
	                	type: "ast",
	                	id: "ExpressionStatement1",
	                	description: "",
	                	analysis: "object2file",
	                	active: true,
	                    query:{"type": "ExpressionStatement", "expression": { "type": "Identifier"}},
                        group: "js-variable",
	                     parse: function(node,parent){

                            var newNode = {};
                            var name = node.expression.name;
	                    	newNode.name = parent.name+"::"+name;
                            newNode.rawName = name;
	                        return newNode;
	                    },
                        rawType: "Undefined"
	                }];


