var parsersHelper = require("../parsersHelper");

module.exports = [   {	
	                	type: "ast",
	                	id: "Object2",
	                	analysis: "object2file",
	                	description: "",
	                	active: true,
	                    query:{type:"VariableDeclarator",init:{type:"NewExpression",callee:{name:"Object"}}},
	                    group: "js-object",
	                    loc: function(node,parent){
                            return JSON.stringify(node.loc);
                        },
	                    name: function(node,parent){
	                        return parent.name+"::"+node.id.name;
	                    },
	                    rawName: ['id.name']
	                }];








