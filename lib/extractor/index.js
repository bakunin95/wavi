var extractor = require('./lib/deps/extractor');
var libGroups = require("./lib/deps/languages/libGroups.js");
var db = require('./lib/deps/database.js');
var async = require('async');

exports.extract = function(website_path,include_node_modules,callback) {
	extractor.getRelations(website_path,include_node_modules,function(err){	
    	db.findNodesById({},function(nodes){
    		async.sortBy(nodes, function(myObject, cbSortBy){					    
			   cbSortBy(null,myObject.id);
			}, function(err, sortedNodes){  
	    		db.findLinks({},function(links){
				    callback(err,{"nodes":sortedNodes,"links":links,"groups":libGroups.groups}); 
				});
			});
		});		
	});	
};