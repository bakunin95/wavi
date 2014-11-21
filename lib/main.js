
'use strict';
var constants = require( './deps/utilities/constants' );
var fs = require('graceful-fs');
var relationsClass = require('./deps/relationsClass');
var analyseReportClass = require('./deps/analyzeClass');
var graphvizClass = require('./deps/graphvizClass'); 
var process = require('process');

module.exports = function(program) {
	define( 'TEMPLATE_PATH', "app", this );
	define( 'WEBSITE_PATH', program.args[0], this );
	define( 'RESULT_PATH', program.args[1], this );

	relationsClass.getRelations(constants.WEBSITE_PATH,function(err,relations){	
		errorHandler(err);
		var grapheJSON = relations;
		analyseReportClass.attachReports(relations,function(err,grapheJSON){
			errorHandler(err)		
				if(program.jpg){
					graphvizClass.generateGraph(grapheJSON,"jpg",constants.RESULT_PATH,false,function(err){
						errorHandler(err)
					}); 
				}
				if(program.png){
					graphvizClass.generateGraph(grapheJSON,"png",constants.RESULT_PATH,false,function(err){
						errorHandler(err)
					}); 
				}
				if(program.svg){
					graphvizClass.generateGraph(grapheJSON,"svg",constants.RESULT_PATH,false,function(err){
						errorHandler(err)
					}); 
				}
				if(program.dot){
					graphvizClass.generateGraph(grapheJSON,"dot",constants.RESULT_PATH,false,function(err){
						errorHandler(err)
					}); 
				}
				if(program.pdf){
					graphvizClass.generateGraph(grapheJSON,"pdf",constants.RESULT_PATH,false,function(err){
						errorHandler(err)
					}); 
				}
				if(program.json){
					fs.writeFile(constants.RESULT_PATH, grapheJSON, function(err) {
						errorHandler(err)
					});
				}
		});
	});	

	function errorHandler(err){
		if(err){
			console.log("Error (main.js):",err);
		}	
	}
};