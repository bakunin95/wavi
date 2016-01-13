var path = require("path"),
    url = require("url"),
    fs = require("fs"),
    async = require("async"),
    _ = require('underscore')._;

var libGroups = require('./languages/libGroups');
var Link;
var Node;
var Call;
var Def;
var LinkChild;
var linkSchema = require("../models/link.js")
var nodeSchema = require("../models/node.js")
var callSchema = require("../models/call.js")
var defSchema = require("../models/def.js")
var depsListSchema = require("../models/depList.js")
var linkChildSchema = require("../models/linkChild.js")
var schema;

var database = module.exports = {
	nodeCount:0,
	nodes: [],
	links: [],
	startServer: function(cbServer){
			var Schema = require('jugglingdb').Schema;
			schema = new Schema('sqlite3', {
			   database: ':memory:'
			});

			Link = linkSchema(schema);	
			Node = nodeSchema(schema);
			Call = callSchema(schema);
			Def = defSchema(schema);
			LinkChild = linkChildSchema(schema);
			DepsList = depsListSchema(schema);

		 	// Define the schema in the DB if it is not there		
		    schema.automigrate(function(msg){

		    	cbServer();
			}); 
	},
	loadFromFile: function(jsonFile,cb){		
		fs.readFile(jsonFile, function (err,report) {
			report = JSON.parse(report);
			async.each(report.nodes,function(node,cbAddDb){
				Node.create(node,cbAddDb);
			},function(){
				async.each(report.links,function(link,cbAdd2Db){
					Link.create(link,cbAdd2Db);
				},function(){
					report = null;
					cb();
				});
			});			
		});
	},
	findNodesOptimized: function(query,operation,done){	
		getBatch(0);
		function getBatch(offset){
			switch(query){
				case 1:
					Node.all({limit:50,skip:offset,where:{group:{inq:["js-function", "js-variable", "js-object", "js-array", "js-method", "js-object-assign"]}}},collectData);
				break;
				case 2:
					Node.all({limit:50,skip:offset,where:{group:["js-method-call"]}},collectData);
				break;
			}	
			function collectData(err,docs){
				async.each(docs,function(obj,cbObj){
					operation(obj, cbObj);
				},function(){
					if(docs.length === 0){
						done();
					}
					else{
						getBatch(offset+50);
					}
				});	
			}
		}
	},
	findNodes: function(filter,cbFind){
		if (_.isEmpty(filter)){
			filter = {order:"time"};
		}
		else{
			filter = {where: filter, order:"time"};
		}
		Node.all(filter,function(err,docs) {
			if(docs !== null){
			    	cbFind(docs);
			    }
			    else{
			    	cbFind([]);
		    }
		})
	},
	findNodesById: function(filter,cbFind){
		Node.all({order:"id"},function (err, docs){
			database.errorHandler(err);
		    if(docs !== null){
		    	cbFind(docs);
		    }
		    else{
		    	cbFind([]);
		    }
		});
	},
	getGroupInfo: function(group){
		var libGroup = _.find(libGroups.groups,{keyword:group})
		return libGroup;
	},
	countGroups: function(done){

		var key = 0;
		async.eachSeries(libGroups.groups, function(group,cbCounter){	
			Node.count({"group":group.keyword},function(err,count){
				libGroups.groups[key].count = count;
				key++;
				cbCounter();
			});

		},function(){
			done();
		});
		
	},
	findOneNode: function(filter,cbFind){
		Node.findOne({where:{"name":filter.name}},function(err,docs) {

			 if(docs !== null && docs.length>0){
		    	cbFind(docs);
		    }
		    else{
		    	cbFind([]);
		    } 

		});
	},
	findLinks: function(filter,cbFind){
		if (!_.isEmpty(filter)){
			filter = {where: filter};
		}
		Link.all(filter,function (err, docs){
			database.errorHandler(err);
		    if(docs !== null){
		    	cbFind(docs);
		    }
		    else{
		    	cbFind([]);
		    }
		});


	},
	findLinksWhere: function(filter,cbFind){
		Link.all({where:filter},function (err, docs){
			database.errorHandler(err);
		    if(docs !== null){
		    	cbFind(docs);
		    }
		    else{
		    	cbFind([]);
		    }
		});


	},
	findCalls: function(filter,cbFind){
			Call.all({},function (err, docs){
				database.errorHandler(err);
			    if(docs !== null){
			    	cbFind(docs);
			    }
			    else{
			    	cbFind([]);
			    }
			});

	},
	findDefs: function(filter,cbFind){
			if(_.isUndefined(filter) || filter === undefined){
				cbFind([]);
			}
			else{ 
				if(_.isEmpty(filter)){
					filter = {};
				}
				else{
					filter = {where:filter};
				}
				Def.all(filter,function (err, docs){
					database.errorHandler(err);
				    if(docs !== null){
				    	cbFind(docs);
				    }
				    else{
				    	cbFind([]);
				    }
				});
			}
	},

	findCallsOptimized: function(filter,operation,done){

		var options = {batchSize: 30000};
		if(!_.isEmpty(filter)){
			options.where = filter;
		}

		Call.iterate(options, operation, done);
	},
	findDefsOptimized: function(filter,operation,done){

		var options = {batchSize: 30000};
		if(!_.isEmpty(filter)){
			options.where = filter;
		}

		Def.iterate(options, operation, done);
	},
	findLinkChilds: function(filter,cbFind){

			if(_.isUndefined(filter)){
				filter = {};
			}
			LinkChild.all({},function (err, docs){
				database.errorHandler(err);
			    if(docs !== null){
			    	cbFind(docs);
			    }
			    else{
			    	cbFind([]);
			    }
			});

	},
	findOneDefs: function(filter,cbFind){
			Def.all(filter,function (err, docs){

				database.errorHandler(err);
			    if(docs !== null){
			    	cbFind(docs[0]);
			    }
			    else{
			    	cbFind([]);
			    }
			});

	},
	findOneLink: function(filter,cbFind){	
		Link.find({where:{"name":filter.name}},function(docs) {
			 if(docs !== null && docs.length>0){
		    	cbFind(docs[0]);
		    }
		    else{
		    	cbFind([]);
		    } 

		});
	},
	linkUpdate: function(filter,update,cbUpdateDone){
		Link.find({where:{"name":filter.name}},function(docs) {
			 if(docs !== null && docs.length>0){

			 	Link.save(update,docs[0],function(err,newDoc){
			 		cbFind(newDoc);
			 	});
		    	
		    }
		    else{
		    	cbFind([]);
		    } 

		});
	},
	addExtend: function(node,parent,extendVar,link,cbAddAsset){
		Node.findOne({where: {rootParentId: node.rootParentId, rawName: extendVar[0]}},function(err,newNode1){
			Node.findOne({where: {rootParentId: node.rootParentId, rawName: extendVar[1]}},function(err,newNode2){			
				if(newNode1 !== null && newNode2 !== null){
					Link.create({source:newNode1.id,target:newNode2.id,type:JSON.stringify({label:"Extends","color":"red",fontcolor:"red",arrowhead:"empty"})}, function (err, newNode) {						
								cbAddAsset();
					});
				}
				else{
					cbAddAsset();
				}			
			});
		});
	},
	addAssetAsync: function(node,parent,link,cbAddAsset){
		if(_.isUndefined(node.group)){
	    	node.group = database.assignGroupForNonExisting(node.name); 

	    	if(node.group === "js-unreachable"){
	    		node.rawName = node.name;
	    	} 
	    }    	
 		groupInfo = database.getGroupInfo(node.group);
	    node.groupColor = groupInfo.color;
	    node.groupText = groupInfo.text;
	    node.groupFoci = groupInfo.foci;   
	   	Node.findOne({where: {name: node.name}},function(err,nodeAdded){
			async.series([function(cb){
				if(nodeAdded === null){

					
					Node.create(node, function (err, newNode) {
						database.errorHandler(err); 
						nodeAdded = newNode;
						

						if(nodeAdded.exist !== true){

							var group = database.assignGroupForNonExisting(nodeAdded.name);  

							var groupInfo = database.getGroupInfo(node.group);

						    nodeAdded.groupColor = groupInfo.color;
						    nodeAdded.groupText = groupInfo.text;
						    nodeAdded.groupFoci = groupInfo.foci;
						    nodeAdded.save(cb);
					}
					});
					
				}
				else{
					var assignments = [];
					if(nodeAdded.assignments.length > 0){
						assignments = JSON.parse(nodeAdded.assignments);
					}
					var nodeloc = "";
					if(!_.isUndefined(node.loc) ){
						nodeloc = JSON.parse(node.loc).start.line;
					}
					assignments.push(node.group+", line:"+nodeloc);
					nodeAdded.assignments = JSON.stringify(assignments);
					nodeAdded.save(cb);
				}
			}],function(){
				nodeAdded.data = node.data;
				nodeAdded.save(function(){			
					link.source = parent.id;
				    link.target = nodeAdded.id;
				    if(link.reverse === true){
				    	var temp = link.source;
				    	link.source = link.target;
				    	link.target = temp;
				         delete link.reverse;
				    }
				    if(!_.isUndefined(link.type)){
				    	link.type = JSON.stringify(link.type);
					}
				    if(link.source !== link.target){
				    	Link.findOrCreate({where:{source:link.source,target:link.target}},link,function(err,newLink){
				    		cbAddAsset(null,nodeAdded);
				    	});
				  	}
				  	else{
				  		cbAddAsset(null,nodeAdded);
				  	}
		  		});
		  	});
		});
	},
	reasignParent: function(node,parent,cbReasign){
		Link.findOne({where:{target:parent.id, group:1}},function(err,foundParentLink){
			Link.findOne({where:{target:node.id, group:1}},function(err,foundNodeLink){
		  		if(foundParentLink !== null && foundNodeLink !== null){
		  			foundNodeLink.source = foundParentLink.source;
		  			foundNodeLink.save(cbReasign);
		  		}
		  		else{
		  			cbReasign();
		  		}
	  		});
	  	});
	},
	correctPath: function(filePath,parent,cbCorrectPath){	
		// Relative path must be converted to absolute
    	if(filePath == null || typeof filePath !== "string" || parent == null){
    		cbCorrectPath(null,filePath);
    	}
    	else{
    		if(filePath.substring(0, 2) == "./"){
                filePath = filePath.substring(2);
            }
			database.findOneNode({"name":filePath},function(foundNode1){
				if(!_.isUndefined(foundNode1)){
					cbCorrectPath(null,filePath);	
				}
				else{
					if(_.isUndefined(parent.folder) == false){
						var mixedPath = path.normalize(parent.folder +"/"+ filePath);
					}
					else{
						return cbCorrectPath(null,filePath);				
					}
					mixedPath = mixedPath.replace(/\\/g,"\/" ).replace("//", "/");	
					database.findOneNode({"name":mixedPath},function(foundNode2){
						if(!_.isUndefined(foundNode2)){
							cbCorrectPath(null,mixedPath);
						}
						else{
							cbCorrectPath(null,filePath);
						}	
					});
				}
			});
		}		
    },
	errorHandler: function(err){
		if(err){
			err.file =  "database.js";
			console.log("database",err);
		}
	},
	addLinksAsync: function (link,cbLinkAsync) {
		Link.findOne({where:{source:link.source,target:link.target}},function(err,foundLink){
	  		if(foundLink === null){
	  			if(!_.isUndefined(link.type)){
					link.type = JSON.stringify(link.type);
	  			}		
	  			Link.create(link,function(err,newLink){
	  				cbLinkAsync(null,newLink);
	  			});
	  		}
	  		else{
	  			cbLinkAsync(null,foundLink);
	  		}
	  	});
    },
	addNodesAsync: function (node,cbAddNode) {
		if(_.isUndefined(database.isFirst)){
			database.isFirst = true;
			node.id = 0;
		}   
		if(node.exist !== true){
    		node.exist = false;
    	}
    	if(node.exist){
    		var infoFile = database.getInfoFile(node.name);

    		node.file = infoFile.file;
    		node.folder = infoFile.folder;

    	}
    	else if(_.isUndefined(node.group)){
    		node.group = database.assignGroupForNonExisting(node.name);    	
    	}
		groupInfo = database.getGroupInfo(node.group);

    	node.groupColor = groupInfo.color;
    	node.groupText = groupInfo.text;
    	node.groupFoci = groupInfo.foci;

		Node.create(node, function (err, newNode) {
			database.errorHandler(err); 

			  cbAddNode(null,newNode);
		})
    },
    addLinkChild: function (linkChilds,cbLinkCAsync) {
		LinkChild.create(linkChilds,function(err,newLinkChild){
			cbLinkCAsync(null,newLinkChild);
		});
    },
    addDefs: function (Defs,cbDefAsync) {
		Def.create(Defs,function(err,newDef){
			cbDefAsync(null,newDef);
		});
    },
    addCalls: function (Calls,cbCallAsync) {
		Call.create(Calls,function(err,newCall){
			cbCallAsync(null,newCall);
		});
    },
    addDepsList: function (Calls,cbCallAsync) {
		DepsList.create(dep,function(err,newDep){
			cbCallAsync(null,newDep);
		});
    },
    updateLinkChildList: function (id,value,cbUpdate){
    	LinkChild.findOne({where: {id: id}},function(err,nodeAdded){
    		nodeAdded.allChilds = value;
    		nodeAdded.save(cbUpdate);
    	});
    },
	updateAttribute: function (node,attribute,value,cbUpdate){
		Node.findOne({where: {name: node.name}},function(err,nodeAdded){
			database.errorHandler(err);      	
			nodeAdded.updateAttribute(attribute,value,function(err,nodeAdded2){
				database.errorHandler(err);      	
				cbUpdate(err,nodeAdded2);
			});
		});
    },
    getInfoFile: function(filePath){
    	if(filePath !== null && (typeof filePath == "string")){
	    	var rePattern = new RegExp("^(.+)/([^/]+)");
			var arrMatches = filePath.match(rePattern);	
			if(arrMatches !== null && arrMatches.length>=2){
				return {file:arrMatches[2],folder:arrMatches[1]};
			}
			else{
				return {file:filePath,folder:""};			
			}
		}
		else{
			return {file:filePath,folder:""};			
		}
    },
    getExtension: function(correctedPath){
		var filename = "";
		try{
			filename = url.parse(correctedPath).pathname.split(".").pop().toLowerCase();
		}catch(e){}
		return filename;
	},
	assignGroupForExisting: function(filePath){
		var extension = database.getExtension(filePath);
		var group = "unknown";


		if ((filePath.substring(0, 7) == "http://") || (filePath.substring(0, 8) == "https://")){
			group = "link";
		} 
		else if (filePath.substring(0, 1) == "#"){
			group = "anchor";
		}
		else if (filePath.substring(0, 7) == "mailto:"){
			group = "email";
		}
		else{
			switch(extension){
				case "php":
					group = "php";
				break;
				case "xhtml":
				case "html":
				case "htm":
				case "ejs":
				case "":
				case "/":
					group = "html";
				break;
				case "js":
					group = "js";
				break;
				case "css":
					group = "css";
				break;
				case "class":
					group = "java-class";
				break;
				case "jsp":
					group = "jsp";
				break;
			}
		}		
		return group;
	},
    assignGroupForNonExisting: function(filePath){

		var extension = database.getExtension(filePath);
		var group = "unknown";

		if(filePath == null || typeof filePath !== "string" || filePath == true || _.isUndefined(filePath)){
			return group;
		}

		if (filePath.substring(0, 1) == "#"){
			group = "anchor";
		}
		else if (filePath.substring(0, 7) == "mailto:"){
			group = "email";
		}
		else{
			switch(extension){
				case "php":
					group = "php";
				break;
				case "html":
				case "htm":
				case "ejs":
				case "":
				case "/":
					group = "html";
				break;
				case "js":
						if ((filePath.substring(0, 7) == "http://") || (filePath.substring(0, 8) == "https://")){
							group = "ws";
						}
						else{
							group = "js-unreachable";
						}
				break;
				case "css":
					if ((filePath.substring(0, 7) == "http://") || (filePath.substring(0, 8) == "https://")){
							group = "ws";
						}
						else{
							group = "css-unreachable";
						}
				break;

			}
		}		
		return group;
	}
};