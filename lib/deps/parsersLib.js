var requireDir = require('require-dir'),
			 _ = require('underscore')._,
	     	async = require("async"),
	     	fs = require('graceful-fs'),
 			Log = require('log');     

//var log = new Log('info',fs.createWriteStream('wavi.log'));
var log = {info:function(){}}

var parsersLib = module.exports = {
    processList: function(db,cbProcessList){
    	var parsersList = requireDir("../parsers");

    	parsersList = _.where(parsersList,{"active": true});
    	var priorityList = _.uniq(_.sortBy(_.pluck(parsersList, 'priority')),true);

    	var counter = 0;
    	var maxLenght = 50;
    	var classList = [];
    	var nodesUsed = [];
		async.mapSeries(priorityList, function(currentPriority,cbPriorities){
    		log.info('## Priority start:'+currentPriority);
	    	async.each(_.where(parsersList,{"priority": currentPriority}), function(currentParser,cbParsers){

	    		log.info('Current Parser running',currentParser.stereotype);
    			db.nodes.find({group:currentParser.group},function(err,nodesList){
	    				log.info('"@@ Plugin executing',currentParser.name);
    				if(nodesList !== null && !_.isUndefined(nodesList) && nodesList.length > 0){

    					async.each(nodesList, function(node,cbNodeUpdt){
    						nodesUsed.push(node.id);



    						if(currentParser.attributes !== null && currentParser.attributes.length > 0){
	    						attrList = _.where(currentParser.attributes,{"active": true});
	    						var attributesSlot1 = [];
	    						var attributesSlot2 = [];
	    						async.each(attrList,function(currentAttr,cbAttrList){

	    							db.links.find({source:node.id},function(err,targetList){
		    							db.nodes.find({id: { $in: _.pluck(targetList,"target") },group:currentAttr.group},function(err,attrOfNode){
		    								

		    								async.each(attrOfNode,function(attrNode,cbattrNode){
		    									if(currentAttr.slot ==1){
		    										attributesSlot1.push(parsersLib.removeSpecialChar(currentAttr.title(attrNode)));
		    									}
		    									else{
		    										attributesSlot2.push(parsersLib.removeSpecialChar(currentAttr.title(attrNode)));
		    									}
		    									cbattrNode();
		    								},function(){
		    									cbAttrList();
		    								});
	
		    							});
		    						});
	    						},function(){
	    							var content = "";

	    							if(attributesSlot1.length > 0){
	    								content = '|'+attributesSlot1.join('\\l')+'\\l';
	    							}
	    							if(attributesSlot2.length > 0){
	    								content = content+'|'+attributesSlot2.join('\\l')+'\\l';
	    							}

		    						classList.push({id:node.id,data:{label:'{&laquo;'+currentParser.stereotype+'»\\n'+currentParser.title(node)+content+'}',"shape":"record","style":"filled","fillcolor":currentParser.color}});
		    						setImmediate(cbNodeUpdt());	
	    						});
    						}
    						else{
    							var content = "";
    							classList.push({id:node.id,data:{label:'{&laquo;'+currentParser.stereotype+'»\\n'+parsersLib.removeSpecialChar(currentParser.title(node))+content+'}',"shape":"record","style":"filled","fillcolor":currentParser.color}});
		    					setImmediate(cbNodeUpdt());	
    						}
	    				},function(err){
	    					cbParsers();	    						    			
	    				});
    				}else{
    					log.info('No nodes to parse for ',currentParser.stereotype);

    					cbParsers();
    				}	    				
	    		});


    		}, function(err) {
    			log.info('## Priority done:'+currentPriority);
				parsersLib.errorHandler(err);
				cbPriorities();
			});

		},function(err) {

			parsersLib.errorHandler(err);
			log.info('## All Plugin executed');
			db.links.find({ $and: [{ target: { $in: nodesUsed } }, { source: { $in: nodesUsed } }]  },function(err,newLinks){
				cbProcessList(err, classList,newLinks);
			});			
			
		});
    },
   	removeSpecialChar: function(str){
	    	if(str !== null && _.isUndefined(str) === false){
		    	var str = str.replace(/\\n/g, "\\n")
	                      .replace(/\\'/g, "\\'")
	                      .replace(/\\"/g, '\\"')
	                      .replace(/\\&/g, "\\&")
	                      .replace(/\\r/g, "\\r")
	                      .replace(/\\t/g, "\\t")
	                      .replace(/\\b/g, "\\b")
	                      .replace(/\\f/g, "\\f")
	                      .replace(/\\\//g, "/")
	                      .replace( /([^\x00-\xFF]|\s)*$/g, '')
	                       .replace(/[`~!@$%^&*|+=?;'"<>\\\/]/gi, '');
	                      //.replace(/[`~!@#$%^&*()_|+\-=?;'",.<>\\\/]/gi, '');
            }


            //.replace(/[`~!@$%^&#.*_|+\-=?;'"<>]/gi, '');

            //.replace(/\W/g, '');


            	                      //.replace(/[`~!@$%^&*_|+\-=?;'"<>]/gi, '');
	                      //.replace(/[`~!@$%^&#.*_|+\-=?;'"<>]/gi, '');
            return str;
	},
    errorHandler: function(err){
		if(err){
			err.file =  "parsersLib.js";
			err.func = func;
			console.log("Error",err);
		}
	}
};