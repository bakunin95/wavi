var	scan = require("./utilities/scan"),
    async = require("async"),
    domClass = require("./languages/domClass.js"),
    jsClass = require("./languages/jsClass.js"),
    miscClass = require("./languages/miscClass.js"),
    libGroups = require("./languages/libGroups.js"),
    _ = require('underscore')._,
    db = require("./database.js");

var extractor = module.exports = {
    website_folder: null,
    getRelations: function(website_folder,include_node_modules,callbackMain){
    	async.waterfall([
    		function(cbFirst){
    			// Create SQLite database
    			db.startServer(function(){   				
    				cbFirst();
    			});
    		},
		    function(callbackListFiles){
		    	// Scan existing files
		    	scan(website_folder, ['js','css','html','php','erb','htm','xhtml','tpl','jade','ejs','hbs','jsp'],include_node_modules, function(err, fileList) {
		    		if(fileList.length === 0){
		    			console.log("The path '"+website_folder+"' doesn't exist or is empty !");
		    			process.exit();
		    		}
		    	    extractor.errorHandler(err);	
					callbackListFiles(err,fileList);
		    	});   
		    },
		    function(fileList,callbackCreateNodes){
		    	// Create nodes from existing files
		    	async.eachSeries(fileList, function(filePath,cbEtape1){	
			    	var group = db.assignGroupForExisting(filePath);
		    		db.addNodesAsync({"name":filePath,"group":group, "exist":true},cbEtape1);  
		    	},function(err){
		    		extractor.errorHandler(err);
		    		fileList = null;
		    		callbackCreateNodes(err);
		    	});	    
		    },
		    function(cbDomClass){
		    	// Analyze HTML files
		    	db.findNodes({group:"html"},function(nodesList){
		    		domClass.analyze(nodesList,function(){
		    			console.log("finished HTML analysis...");
		    			cbDomClass();
		    		});
		    	});	    	
		    },
		    function(cbJsClass){
		    	// Analyze JS files
		    	db.findNodes({group:{inq:["js","js-markup"]}},function(nodesList){
		    		jsClass.analyze(nodesList,function(){
		    			console.log("finished js analysis...");
		    			cbJsClass();
		    		});
		    	});
		    },
		    function(cbMiscClass){
		    	// Analyze CSS files
		    	db.findNodes({group:{inq:["css","css-markup"]}},function(nodesList){
		    		miscClass.analyze(nodesList,function(){
		    			console.log("finished misc analysis...");
		    			cbMiscClass();
		    		});
		    	});
		    }
		], function (err) {
	    	db.countGroups(function(){
	    		callbackMain(err);
	    	});
		});
	},
	errorHandler: function(err){
		if(err){
			err.file =  "extractor.js";
			console.log("Error",err);
		}
	}
};