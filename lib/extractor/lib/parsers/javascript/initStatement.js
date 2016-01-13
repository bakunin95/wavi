//var db = require("../../deps/database.js");
//var Def = require("../../models/def.js");
var parsersHelper = require("../parsersHelper");

var _ = require('underscore')._;

module.exports = [ {	    
						type: "ast",
						id: "initStatement", 
						analysis: "variable",
						description: "var a = call();",
						active: true,
	                    query:{"type":"VariableDeclarator","id":{"type":"Identifier"}},
	                    group: "js-function",
	                    loc: function(node,parent){
                            return JSON.stringify(node.loc);
                        },
                        rawName: ['id.name'],
	                    parse: function(node,parent){
 							var newNode = {};                          
                            newNode.data = JSON.stringify(node);
                            newNode.name = parent.name+"::"+node.id.name;                    	
                            if(node.init !== null && node.init.name !== null){
                            	newNode.alias = node.init.name;
                            }
                            if(node.init !== null && node.init.type === "CallExpression" && node.init.callee.name !== null){
                            	newNode.alias = node.init.callee.name;
                            }
	                    	newNode.rawType = "variable";
	                    	if(node.init !== null){
		                    	switch(node.init.type){
	                            	case "FunctionExpression":

	                            		newNode.group = "js-function";
	                            	break;
	                            	case "CallExpression":
	                            		newNode.group = "js-function";
	                            		if(node.init.callee.name === "require"){
	                            			newNode.name = parent.name+"::"+node.id.name+"::"+parsersHelper.getCount("require");
	                            			newNode.group = "unknown";
	                            			if(!_.isUndefined(node.init) && node.init !== null && !_.isUndefined(node.init.arguments)){
			                                    newNode.rawName = parsersHelper.correctPathSync(node.init.arguments[0].value,parent);		                                  
			                                    newNode.alias = node.id.name;
			                                }
											var rawValue = [];
			                                 _.each(node.init.arguments,function(param){
				                                rawValue.push(param.type);
				                            });

				                            if(rawValue.length>0){
				                                newNode.rawValue =  rawValue.join(", ");
				                            }
	                            		}
	                            	break;
	                            	case "ObjectExpression":
	                            		newNode.group = "js-object";
	                            		newNode.alias = node.init.name;
	                            	break;
	                            	case "MemberExpression":
	                            		newNode.group = "js-object";

	                            		if(node.right && node.right.callee){
		                            		if(node.right.callee.type === "Identifier" && node.right.callee.name === "Array"){
		                            			newNode.group = "js-array";
		                            			newNode.rawType = "array";
		                            		}
		                            		else if(node.right.callee.type === "Identifier" && node.right.callee.name === "String"){
		                            			newNode.group = "js-variable";
		                            			newNode.rawType = "string";
		                            		}
		                            		else if(node.right.callee.type === "Identifier" && node.right.callee.name === "Number"){
		                            			newNode.group = "js-variable";
		                            			newNode.rawType = "number";
		                            		}
		                            		else if(node.right.callee.type === "Identifier" && node.right.callee.name === "Boolean"){
		                            			newNode.group = "js-variable";
		                            			newNode.rawType = "boolean";
		                            		}
										}
										else if (node.init.property && node.init.property.type && node.init.property.type === "Identifier"){
											newNode.alias = node.init.property.name;
										}

	                            		
	                            	break;
	                            	case "ArrayExpression":
	                            		newNode.group = "js-array";
	                            	break;
	                            	case "NewExpression":
	                            		newNode.group = "js-function";

	                            		newNode.rawName = node.name;

	                            		if(_.isUndefined(node.init.callee.name) || node.init.callee.name === null){
	                            			newNode.group = "unknown";
	                            		}
	                            		newNode.alias = node.init.callee.name;
	                            		newNode.newExp = node.init.callee.name;

	                            		if(node.init.callee.type === "Identifier" && node.init.callee.name === "Array"){
	                            			newNode.group = "js-array";
	                            			newNode.rawType = "array";
	                            		}
	                            		else if(node.init.callee.type === "Identifier" && node.init.callee.name === "String"){
	                            			newNode.group = "js-variable";
	                            			newNode.rawType = "string";
	                            		}
	                            		else if(node.init.callee.type === "Identifier" && node.init.callee.name === "Number"){
	                            			newNode.group = "js-variable";
	                            			newNode.rawType = "number";
	                            		}
	                            		else if(node.init.callee.type === "Identifier" && node.init.callee.name === "Boolean"){
	                            			newNode.group = "js-variable";
	                            			newNode.rawType = "boolean";
	                            		}

	                            	break;
	                            	case "Literal":

	                            		newNode.group = "js-variable";
	                            		newNode.rawType = (typeof node.init.value);

	                            		if(node.init.value === null){
	                            			newNode.rawType = "null";
	                            		}

	                            		if(typeof node.init.value === "object"){
				                    		newNode.rawValue = undefined; 
				                    	}
				                    	else{
				                    		newNode.rawValue = node.init.value;
				                    	}

	                            	break;
	                            	case "Identifier":
	                            		newNode.group = "js-variable";
	                            		newNode.alias = node.init.name;
	                            		newNode.rawValue = node.init.name;
	                            	break;
	                            	case "AssignmentExpression":
	                            		var Alias = parsersHelper.getAlias([],node.init);
			                            switch(Alias.value.type){
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
			                            		newNode.group = "js-variable";
			                            }
			                            newNode.name = parent.name+"::"+node.id.name;
			                            newNode.alias = Alias.name;
	                            	break;
	                            	default:
	                            		newNode.group = "js-variable";

	                            }
                            }
                            else{
                            	newNode.group = "js-variable";

                            	newNode.rawValue = null;
                            }

                            if(node.init === null || _.isUndefined(node.init)){
                            	newNode.rawValue = "undefined";
                            }
                            else if(!_.isUndefined(node.init.arguments)){
                                var rawValue = [];
                                _.each(node.init.arguments,function(arguments){

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
                            else if(!_.isUndefined(node.init.params)){
                                var rawValue = [];
                                _.each(node.init.params,function(arguments){
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

	                        return newNode;
	                    }
	                }];




