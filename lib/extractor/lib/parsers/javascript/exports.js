var parsersHelper = require("../parsersHelper");
var _ = require('underscore')._;

module.exports = [ {	
                        id: "ExportDeclaration1",
                        description: "import Name",
                        analysis: "function2file",
                        active: true,
                        query:{"type":"ExportAllDeclaration"},
                        link: {"arrowtail":"vee",color:"red","style":"dashed",fontcolor:"red",label:"Export",group:"2"},
                        group: "unknown",
                        parse: function(node,parent){
                            var newNode = {};
                            newNode.name = "";
                            if(!_.isUndefined(node.source) && node.source !== null){                               
                                newNode.group = "js-export";
                                newNode.rawName = node.source.value;
                                newNode.name = parsersHelper.correctPathSync(node.source.value,parent)+".js";
                                if(!_.isUndefined(node)){
                                    newNode.data = JSON.stringify(node);
                                }
                            } 
                            return newNode;
                        }
                    },
                    {   
                        id: "ExportDeclaration1",
                        description: "import Name",
                        analysis: "function2file",
                        active: true,
                        query:{"type":"ExportNamedDeclaration"},
                        group: "unknown",
                        link: {"arrowtail":"vee",color:"red","style":"dashed",fontcolor:"red",label:"Export",group:"2"},
                        parse: function(node,parent){
                            var newNode = {};
                            newNode.name = "";
                            if(!_.isUndefined(node.source) && node.source !== null){
                                newNode.group = "js-export";
                                newNode.rawName = node.source.value;
                                newNode.name = parsersHelper.correctPathSync(node.source.value,parent);
                                if(!_.isUndefined(node)){
                                    newNode.data = JSON.stringify(node);
                                }
                            }                          
                            return newNode;
                        }
                    }]