var fs = require("fs");
var estraverse = require("estraverse");
var acorn = require("acorn/dist/acorn_loose");
var umd = require('acorn-umd');
var escope = require('escope');
var async = require("async");
var ecjson=require('ecjson');
var db = require("../database.js");
var sloc  = require('sloc');
var parsersHelper = require("../../parsers/parsersHelper");
var _ = require("lodash");
_.mixin(require("lodash-deep"));
var requireDir = require('require-dir');
var parsersList = requireDir("../../parsers/javascript/");


var evals = 0;
var applys = 0;
var calls = 0;
var withs = 0;
var newFunc = 0;


var jsClass = module.exports = {
	node: [],
	cnode: [],
	nodeId: 0,
	sloc:0,
	after: [],
	analyze: function(files,cbjsClass){
		jsClass.parsers = _.where(_.flatten(_.map(parsersList, function(n) { return n; })),{"active": true});
		jsClass.queries = _.pluck(jsClass.parsers,"query");
		var filesDone = 0;
		var currentPercent = 5;

		async.eachSeries(files,function(parent,cbFiles){
			var data = "";
			async.waterfall([
			    function(callback){
					if(((filesDone/files.length)*100)>currentPercent){
						currentPercent +=5;
						console.log(Math.round((filesDone/files.length)*100)+ "% JavaScripts files analyzed...");
					}
			    	if(parent.group === "js-markup"){
						data = parent.data;
						if(_.isUndefined(data)){
							cbFiles();
						}
						else{
							callback(null, data);
						}
						
					}
					else{
						fs.readFile(parent.name,'utf8',callback);
					}		        
			    },
			    function(data, callback){
					var stats = sloc(data,"js");
			    	jsClass.sloc += stats.source;
					data = data.replace("#!/usr/bin/env node","");
					try{
						var ast = acorn.parse_dammit(data, {locations: true,sourceType: 'module', ecmaVersion: 6, ranges : true });
					}catch(e){
						console.log(e);
						var ast = acorn.parse_dammit(data, {locations: true,sourceType: 'script',allowImportExportEverywhere: true, ecmaVersion: 6, ranges : true });	
					}
					var imports = umd(ast, {
					    es6: true, amd: true, cjs: true
					});
					if(_.isUndefined(imports)){
						imports = [];
					}
					async.eachSeries(imports,function(imp,cb){						
						var linkLabel = "Require";
						if(imp.type === "ImportDeclaration"){
							linkLabel = "Import";
							var importedVar = [];

							if(!_.isUndefined(imp.specifiers) && imp.specifiers !== null){
								var impVarList = _.pluck(imp.specifiers,"imported");
								_.each(impVarList,function(currentVar){
									if(!_.isUndefined(currentVar) && currentVar.type === "Identifier" && !_.isUndefined(currentVar.name)){
										importedVar.push(currentVar.name);
									}
								});
								if(importedVar.length === 0){
									linkLabel += " *"
								}
								else{
									linkLabel += " ["+importedVar.join(", ")+"]";
								}
							}

						}

						if(imp.source && imp.source.length === undefined){
							imp.source = [imp.source];
						}
						else{
							imp.source = imp.sources;
						}
							async.eachSeries(imp.source,function(source,cb2){
								if(!_.isUndefined(source)){
									switch(source.type){
										case "Literal":
											var correctedPath = parsersHelper.correctPathSync(source.value,parent);
											if(!_.isUndefined(source.value)){
												if(correctedPath.substr(correctedPath.length - 3) !== ".js"){
													correctedPath = correctedPath+".js";
												}
												parsersHelper.findNodes({name:correctedPath},function(foundNodes){
													var finalName = correctedPath;
													if(foundNodes.length === 0){
														finalName = "require>"+source.value;
													}
													parsersHelper.addNode({name:finalName, rawName:source.value, group:"js-require"},parent,{group:2,type:{"label":linkLabel,fontcolor:"red",style:"dashed","color":"red",arrowtail:"vee"}},cb2);	 													
												});
											}
											else{
												cb2();
											}
										break;
									}
								}
								else{
									cb2();
								}
							},cb);															
					},function(){
						jsClass.readAST(ast,parent,function(err,elements){
							jsClass.recursiveNode(elements,parent,parent,function(){
								ast = null;
								data = null;
								parent = null;
								filesDone++;
						        cbFiles();
						    });
						});
					});
				}	
			]);
		},function(){
			cbjsClass();	
		});

	},
	getFirstDefinedArray: function(AST,list){
      var Defined = "";
      var candidate = null;

      _.each(list,function(filter){
            var currentFilter = filter.split(".");
            if(!_.isUndefined(AST[currentFilter[0]])){
              candidate = AST[currentFilter[0]];
            }
            else{
              return false;
            }
            var n = 1;
            if(currentFilter.length > 1){
              while (n !== currentFilter.length) {
                if(!_.isUndefined(candidate[currentFilter[n]])){
                  candidate = candidate[currentFilter[n]];
                }
                else{
                  break;
                }
                n++;
              }
            }
            if(n == currentFilter.length){
              Defined = candidate;
            } 
       });
      return Defined;
    },
	generateNode: function(node,parent,rootParent,parser,scope,fullScope,range,childRange){
		var newNode = {};
		newNode.nodeId = jsClass.nodeId;
		newNode.rootParent = rootParent.name;
		newNode.rootParentId = rootParent.id;
		newNode.rootParentType = rootParent.type;
		newNode.hierarchyFile = rootParent.hierarchyFile;
		newNode.scope = scope;
		newNode.callRange = node.range[0]+"-"+node.range[1];
		newNode.range = range;
		newNode.childRange = childRange;
		newNode.fullScope = fullScope;

		if(typeof parser.name === "function"){
			newNode.name = parser.name(node,parent);
		}
		else if(typeof parser.name === "object") {
			newNode.name = jsClass.getFirstDefinedArray(node,parser.name);
		}	

		newNode.rawName = jsClass.autoGenField("rawName",node,parent,parser);
		newNode.rawValue = jsClass.autoGenField("rawValue",node,parent,parser);
		newNode.rawType = jsClass.autoGenField("rawType",node,parent,parser);
		newNode.visibility = jsClass.autoGenField("visibility",node,parent,parser);
		newNode.loc = jsClass.autoGenField("loc",node,parent,parser);
		newNode.alias = jsClass.autoGenField("alias",node,parent,parser);
		newNode.parsedBy = parser.id;
		newNode.group = jsClass.autoGenField("group",node,parent,parser);

		if(typeof parser.parse === "function"){
			_.assign(newNode, parser.parse(node,parent));
		}
		if(!_.isUndefined(newNode.name)){
			newNode.hierarchyElement =  newNode.name.split("::").length;
		}
		jsClass.nodeId++;

		return newNode;
	},
	autoGenField: function(field,node,parent,parser){
		if(typeof parser[field] === "function"){
			return parser[field](node,parent);
		}
		else if(typeof parser[field] === "object") {
			return jsClass.getFirstDefinedArray(node,parser[field]);
		}
		else{
			return parser[field];
		}
	},
	readAST: function(ast,parent,cb){
		var scopeManager = escope.analyze(ast,{ecmaVersion: 6, sourceType: 'module'});
		var code = [];
		var childRange = [];		
		var currentScope = scopeManager.acquire(ast);
		var fullScope = [JSON.stringify(currentScope.block.loc)];
		var scope = JSON.stringify(currentScope.block.loc);
		var range = JSON.stringify(currentScope.block.range);
		var res = estraverse.replace(ast, {
		    enter: function (node,parentNode) {
		    	var foundMatch = [];
		        var queryNum = 0;
		        _.each(jsClass.queries,function(query){

		            if(_.isMatch(node,query)){
		            	
         				try{	
			            	var parser = _.findWhere(jsClass.parsers, {query: query});
							var parserAll = _.where(jsClass.parsers, {query: query});
							foundMatch.push(parser.id);
         					var genNode = {};
         					genNode.nodeId = jsClass.nodeId++;
	        				jsClass.cnode[genNode.nodeId] = [node,parser,scope,fullScope,range,childRange];
			            	jsClass.after[genNode.nodeId] = parser.after;
			                code.push("<node id='"+genNode.nodeId+"'>");
			                node.match = true;
			            	
		            	}
		            	catch(e){
		            	}
		            }
		            queryNum++;
		        });			
		       return node;
		    },
		    leave: function (node,parent) {
		        if(node.match === true){
		            code.push("</node>");
		        }
		    }
		});	 
		if(code.length>0){
			jsClass.Classednode = _.indexBy(jsClass.node, 'nodeId');
			jsClass.node = [];
			ecjson.XmlToJson(code.join(""), function (nodeslist) {
			    cb(null,nodeslist);
			});
		}
		else{
			cb(null,null);
		}
	},
	recursiveNode: function(root,parent,rootParent,cbRecursive){
		if(root == null){
			cbRecursive();
			return;
		}
	    if(_.isUndefined(root.node.length)){
	        root.node = [root.node];
	    }
	    async.eachSeries(root.node,function(currentNode,cb){
	    	var parser = jsClass.cnode[currentNode.id][1];
	    	var identifier = jsClass.cnode[currentNode.id][1].id;
	    	var descr = jsClass.cnode[currentNode.id][1].description;
	    	var analysis = jsClass.cnode[currentNode.id][1].analysis;
	    	var code = null;
	    	var node = jsClass.generateNode(jsClass.cnode[currentNode.id][0],parent,rootParent,jsClass.cnode[currentNode.id][1],jsClass.cnode[currentNode.id][2],jsClass.cnode[currentNode.id][3],jsClass.cnode[currentNode.id][4],jsClass.cnode[currentNode.id][5]);
	    	var link = {};

			if(!_.isUndefined(parser.link)){
				link.type = parser.link;
				if(!_.isUndefined(link.type.group)){
					link.group = link.type.group;
					delete link.type.group;
				}
				else{
					link.group = 1;
				}
			}
			else{
				link.group = 1;
				link.type = {"dir":"back","arrowtail":"diamond"};
			}

	        if(node.addAsset === false){
	        	 cb();
	        }
	        else{
		        db.addAssetAsync(node,parent,link,function(err,newParent){
		        	async.series([
					    function(cbAfter){
					    	if(!_.isUndefined(jsClass.after[currentNode.id])){
						    	jsClass.after[currentNode.id](newParent,parent,cbAfter);					    	
					    	}
					    	else{
					    		cbAfter();	
					    	}
					    },
					    function(cbRec){ 
					    	if(!_.isUndefined(currentNode.node)){
					            jsClass.recursiveNode(currentNode,newParent,rootParent,cb);
					        }
					        else{
					            cb();
					        }
					        jsClass.cnode[currentNode.id] = null;
					        cbRec();
					    }
					]);
			    });
		    }
	    },function(err){
	    	node = null;
	    	cbRecursive();	        
	    });
	}
}