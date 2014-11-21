var fs = require("graceful-fs"),
    path = require("path"),
    url = require("url"),
	scan = require("./utilities/scan"),
	util = require("util"),
	Datastore = require('nedb'),
    cheerio = require('cheerio'),
    async = require("async"),
	libCSS = require("./languages/libCSS.js"),
    libHTML = require("./languages/libHTML.js"),
    libJavaScript = require("./languages/libJavaScript.js"),
    libGroups = require("./languages/libGroups.js"),
    _ = require('underscore')._;


var db = {};

db.nodes = new Datastore();
db.links = new Datastore(); 
db.assetsList = new Datastore(); 

var relationsClass = module.exports = {
    nodes: new Array(),
    links: new Array(),
    nodeCount:0,
    processed: false,
    website_folder: null,
    "sourceCount":0,
    "targetCount":0,
    "internalCount":0,
    "groupCount": {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0},
    findNodeAsync: function(node,callback){
    	db.nodes.find(node, function (err, docs) {
    		relationsClass.errorHandler(err);
    		callback(err,docs);
		});
    },
    getId: function(){
    	relationsClass.nodeCount++;
    	return relationsClass.nodeCount-1;
    },
    addNodesAsync: function (node,cbAddNode) {
    	if(node.exist){
    		node.infoFile = relationsClass.getInfoFile(node.name);
    	}
    	else{
    		node.group = relationsClass.assignGroupForNonExisting(node.name);
    	}
    	node.id = relationsClass.getId();

		db.nodes.insert(node, function (err, newNode) { 
			relationsClass.errorHandler(err);
			cbAddNode(err,newNode);
		});	
    },
    getParentNodes: function (node){
    	var parentList = [];
    	var nodeId = relationsClass.nodes.indexOf(node);
    	_.each(relationsClass.links, function (currentLink) {
			if(currentLink.target == nodeId){
				parentList.push(currentLink.source);
			}
		});
    	return parentList;
    },
    getParentNodesFromId: function (nodeId){
    	var parentList = [];
    	_.each(relationsClass.links, function (currentLink) {
			if(currentLink.target == nodeId){
				parentList.push(currentLink.source);
			}
		});
    	return parentList;
    },
    addLinksAsync: function (source,target,cbLinkAsync) {
    	if(source.id !== target.id){
    		db.links.find({"source":source.id,"target":target.id},function(err,res){
    			relationsClass.errorHandler(err);
    			if(res.length == 0){
		    		if((source.group == 1 && target.group == 2) ){
		    			if (_.isUndefined(target.infoFile) == false){
		    				target.infoFile["parentFolder"] = source.infoFile.folder;
		    			}
		    			else{
		    				target["infoFile"] = {"parentFolder":source.infoFile.folder};
		    			}
						db.nodes.update({"name":target.name},target,function (err){
							relationsClass.errorHandler(err);
				        	db.links.insert({"source":source.id,"target":target.id}, function (err, newDoc) {  
				        		relationsClass.errorHandler(err);

								cbLinkAsync();
							});
						});
					}
					else{
						db.links.insert({"source":source.id,"target":target.id}, function (err, newDoc) {  
							relationsClass.errorHandler(err);

							cbLinkAsync();
						});
					}
				}
				else{
					cbLinkAsync();
				}
			});	

    	}
    	else{
    		cbLinkAsync();
    	}
    	
    },
    assignGroupForExisting: function(filePath){
		var extension = relationsClass.getExtension(filePath);
		var group = 15;


		if ((filePath.substring(0, 7) == "http://") || (filePath.substring(0, 8) == "https://")){
			group = 5;
		} 
		else if (filePath.substring(0, 1) == "#"){
			group = 6;
		}
		else if (filePath.substring(0, 7) == "mailto:"){
			group = 7;
		}
		else{
			switch(extension){
				case "php":
					group = 14;
				break;
				case "html":
				case "htm":
				case "":
				case "/":
					group = 1;
				break;
				case "js":
					group = 2;
				break;
				case "css":
					group = 3;
				break;
			}
		}		
		return group;
	},
	assignGroupForNonExisting: function(filePath){
		var extension = relationsClass.getExtension(filePath);
		var group = 15;


		if(filePath == null || _.isUndefined(filePath)){
			return group;
		}

		if (filePath.substring(0, 1) == "#"){
			group = 6;
		}
		else if (filePath.substring(0, 7) == "mailto:"){
			group = 7;
		}
		else{
			switch(extension){
				case "php":
					group = 14;
				break;
				case "html":
				case "htm":
				case "":
				case "/":
					group = 5;
				break;
				case "js":
						if ((filePath.substring(0, 7) == "http://") || (filePath.substring(0, 8) == "https://")){
							group = 11;
						}
						else{
							group = 10;
						}
				break;
				case "css":
					if ((filePath.substring(0, 7) == "http://") || (filePath.substring(0, 8) == "https://")){
							group = 13;
						}
						else{
							group = 12;
						}
				break;
			}
		}		
		return group;
	},
	findAssetsForExisting: function(node,data,callback){
		if(libGroups.isExistingHTML(node.group)){
			callback(libHTML.findAssets(node,data));
		}
		else if(libGroups.isExistingJavaScript(node.group)){
			libJavaScript.findAssets(node,data,function(err,result){
				relationsClass.errorHandler(err);

				callback(result);
			});
		}
		else if(libGroups.isExistingCSS(node.group)){
			callback(libCSS.findAssets(node,data));
		}
		else{
			callback(null);
		}
	},
	addAssetAsync: function(node,asset,cbabc){
		relationsClass.correctPath(asset.name,node,function(err,correctedPath){
			relationsClass.errorHandler(err);
			db.nodes.findOne({"name":correctedPath},function(err,source){
				relationsClass.errorHandler(err);
				if (_.isUndefined(source) == false && source !== null){
					relationsClass.addLinksAsync(node,source,function(err,linkAdded){
    					relationsClass.errorHandler(err);
						cbabc(err);
					});
								
				}
				else{
					relationsClass.addNodesAsync({"name":correctedPath,"group":15},function(err,nodeAdded){
						relationsClass.errorHandler(err);
						relationsClass.addLinksAsync(node,nodeAdded,function(err,linkAdded){
						    relationsClass.errorHandler(err);						
							cbabc(err);								
						});
					});		
				}					
			});
		});	
	},
    getRelations: function(website_folder,callbackMain){
    		relationsClass.website_folder = website_folder;
	    	if(relationsClass.processed == true){
	    		callbackMain(null, relationsClass.result);
	    		return;
	    	}

	    	async.waterfall([
			    function(callbackListFiles){
			    	// Get existing file list
			    	scan(website_folder, ['js','css','html','php','erb','htm','tpl','jade','ejs','hbs'], function(err, fileList) {	
			    	    relationsClass.errorHandler(err);	    	
						callbackListFiles(err,fileList);
			    	});   
			    },
			    function(fileList,callbackCreateNodes){
			    	// Create nodes from existing files
			    	async.each(fileList, function(filePath,cbEtape1){							
						relationsClass.addNodesAsync({"name":filePath,"group":relationsClass.assignGroupForExisting(filePath), "exist":true},cbEtape1);		    											    		
			    	},function(err){
			    		relationsClass.errorHandler(err);
			    		fileList = null;
			    		callbackCreateNodes(err,"");
			    	});	    
			    },
			    function(nodesList,callbackAssets){
			    	// Find Links
			    	var assetsList = new Array();
			    	db.nodes.find({}).sort({ "exist": -1, "group": 1  }).exec(function(err,nodesList){
			    		relationsClass.errorHandler(err);
				    	async.each(nodesList, function(node,callbackTrouverAssets){							
				    		fs.readFile(node.name,"utf-8", function(err,data){
				    			relationsClass.errorHandler(err);
						    	relationsClass.findAssetsForExisting(node,data,function(assets){
						    		if(assets !== null && node !== null){
						    			assetsList.push(assets);
						    		}
						    		db.nodes.update({"name":node.name},node,function (err){
										callbackTrouverAssets();
									});
						    	});
						    });											    		
				    	},function(err){
				    		relationsClass.errorHandler(err);
				    		nodesList = null;
				    		callbackAssets(err,assetsList);
				    	});	 

			    	});  	
			    },
			    function(assetsList,cbPRIORITE1){
				        async.mapSeries(assetsList, function(data,cbAssetsP1){
				        	if(_.isUndefined(data) == false && _.isUndefined(data[1]) == false && data !== null && data[1] !== null){	
				        		async.mapSeries(data[1], function(asset,cbfin){
				        			if(_.isUndefined(asset) == false && asset !== null && data[0] !== null){				        			
				        				relationsClass.addAssetAsync(data[0],asset,function(err){
						        				relationsClass.errorHandler(err);
						        				cbfin();
						        		});
					        		}
					        		else{
					        			cbfin();
					        		}					        		
				        		},function(err){		        			
				        			relationsClass.errorHandler(err);
				        			cbAssetsP1();
				        		});
							}
							else{
								cbAssetsP1();
							}			     
				        },function(err){
				        	relationsClass.errorHandler(err);				        	
				    		cbPRIORITE1();
				    	});
			    }
			], function (err) {
				// Generate JSON file containing nodes and links
				relationsClass.errorHandler(err);
				db.nodes.find({}).sort({ "id": 1 }).exec(function(err,nodes){
					relationsClass.errorHandler(err);
					db.links.find({},function(err,links){
						relationsClass.errorHandler(err);
			   			 callbackMain(err, JSON.stringify({"nodes":nodes,"links":links,"info":{"groupCount":relationsClass.groupCount}}));
					});
				});			  
			});
	},
	correctPath: function(filePath,parent,cbCorrectPath){	
		// Relative path must be converted to absolute
    	if(filePath == null || typeof filePath !== "string" || parent == null){
    		cbCorrectPath(null,filePath);
    	}
    	else{
			var fileInfo = relationsClass.getInfoFile(filePath);
  
			db.nodes.findOne({"name":filePath},function(err,found){
				relationsClass.errorHandler(err);
				if (found !== null) {
				  	cbCorrectPath(null,filePath);
			  	}
			  	else{

			  		db.nodes.findOne({"name":parent.name},function(err,parent2){
			  			relationsClass.errorHandler(err);
						if(_.isUndefined(parent2.infoFile.parentFolder) == false){	
							var mixedPath = path.normalize(parent2.infoFile.parentFolder +"/"+ filePath); 
						}
						else{
							var mixedPath = path.normalize(parent2.infoFile.folder +"/"+ filePath);
						}
					
						mixedPath = mixedPath.replace(/\\/g,"\/" ).replace("//", "/");	

						db.nodes.findOne({"name":mixedPath},function(err,found){
							relationsClass.errorHandler(err);
							if(found !== null){
								cbCorrectPath(null,mixedPath);
							}
							else{
								cbCorrectPath(null,filePath);
							}
							
						});					

					});
			  	}
			  	
			});
			
		}
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
	errorHandler: function(err){
		if(err){
			err.file =  "relationsClass.js";
			err.func = func;
			console.log("Error",err);
		}
	}
};