
var parsersHelper = require("../parsersHelper");

var _ = require('underscore')._;

module.exports = [ {	
                        id: "classDeclaration1",
                        description: "class Name",
                        analysis: "function2file",
                        active: true,
                        query:{"type":"ClassDeclaration"},
                        link: {"dir":"back","arrowtail":"diamond"},
                        group: "js-class",
                        loc: function(node,parent){
                            return JSON.stringify(node.loc);
                        },
                        name: function(node,parent){  
                            return parent.name+"::"+node.id.name+"::"+parsersHelper.getCount("class");
                        },
                        rawName: ['id.name'],
                        parse:function(node,parent){
                            var newNode = {};
                            newNode.data = JSON.stringify(node);
                            return newNode;
                        },
                        after: function(node,parent,cb){
                            var data = JSON.parse(node.data);
                            if(data.superClass !== null){
                                var extend = data.superClass.name;
                                parsersHelper.addExtend(node,node,[node.rawName,extend],{},function(){          
                                    cb();   
                                }); 
                            }
                            else{
                                cb();
                            }
                        }
                    },
                   {	
                        id: "methodDeclarationvv1",
                        description: "method()",
                        analysis: "function2file",
                        active: true,
                        query:{type:"MethodDefinition"},
                        group: "js-method",
                        loc: function(node,parent){
                            return JSON.stringify(node.loc);
                        },
                        name: function(node,parent){
                            return parent.name+"::"+node.key.name+"()";
                        },
                        rawName: ['key.name'],
                        rawValue: function(node,parent){
                            var rawValue = [];
                            _.each(node.value.params,function(param){
                                if(!_.isUndefined(param.name) && param.name !== ""){
                                    rawValue.push(param.name);
                                 }
                                 else if(!_.isUndefined(param.value) && param.value !== ""){
                                    rawValue.push(param.value);
                                 }
                            });
                            if(rawValue.length>0){
                                return rawValue.join(", ");
                            }
                            else{
                                return "";
                            }
                        }
                    }];