
'use strict';
var constants = require( './deps/utilities/constants' );
var fs = require('graceful-fs');
var relationsClass = require('./deps/relationsClass');
var libGroups = require('./deps/languages/libGroups');
var process = require('process');
var db = require('./deps/database');
var async = require('async');
var log = new Log('info',fs.createWriteStream('dependency.log'));


module.exports = function(program) {
	define( 'TEMPLATE_PATH', "app", this );
	define( 'WEBSITE_PATH', program.args[0], this );
	define( 'RESULT_PATH', program.args[1], this );

	var includenodemodules = false;
	if(program.includenodemodules){
		includenodemodules = true;
	}

	relationsClass.getRelations(constants.WEBSITE_PATH,includenodemodules,function(err){	
		errorHandler(err);

		db.findNodesById({},function(nodes){
    		async.sortBy(nodes, function(myObject, cbSortBy){					    
			   cbSortBy(null,myObject.id);
			}, function(err, sortedNodes){  
	    		db.findLinks({},function(links){
				    var report = {"nodes":sortedNodes,"links":links,"groups":libGroups.groups}; 
				    fs.writeFile(constants.RESULT_PATH, JSON.stringify(report,null,4), function(err) {
						console.lod("done")
					});
				});
			});
		});		

	});	

	function errorHandler(err){
		if(err){
			console.log("Error (main.js):",err);
		}	
	}
};