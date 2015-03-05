var requireDir = require('require-dir'),
			 _ = require('underscore')._,
	     	async = require("async"),
	     	fs = require('graceful-fs'),
 			Log = require('log');     

//var log = new Log('info',fs.createWriteStream('wavi.log'));
var log = {info:function(){}}

var parsersLib = module.exports = {
    processList: function(Node,Link,cbProcessList){


    	var parsersList = requireDir("../parsers");

    	parsersList = _.where(parsersList,{"active": true});
    	var priorityList = _.uniq(_.sortBy(_.pluck(parsersList, 'priority')),true);

    	var counter = 0;
    	var maxLenght = 50;
    	var classList = [];
    	var xmi = [];
    	var nodesUsed = [];
		async.mapSeries(priorityList, function(currentPriority,cbPriorities){
    		log.info('## Priority start:'+currentPriority);
	    	async.each(_.where(parsersList,{"priority": currentPriority}), function(currentParser,cbParsers){

	    		log.info('Current Parser running',currentParser.stereotype);

	    		


    			//db.nodes.find({group:currentParser.group},function(err,nodesList){
    			Node.all({where : {group:currentParser.group,isChild:{nin:["true"]}}},function(err,nodesList){
    			
	    				log.info('"@@ Plugin executing',currentParser.name);
    				if(nodesList !== null && !_.isUndefined(nodesList) && nodesList.length > 0){

    					async.each(nodesList, function(node,cbNodeUpdt){
    						nodesUsed.push(node.id);
    						if(currentParser.attributes !== null && currentParser.attributes.length > 0){
	    						attrList = _.where(currentParser.attributes,{"active": true});
	    						var attributesSlot1 = [];
	    						var attributesSlot2 = [];
	    						async.each(attrList,function(currentAttr,cbAttrList){

	    							
	    							//{group:{inq:["js","js-markup"]}}

	    							Link.all({where : {source:node.id}},function(err,targetList){
	    							//db.links.find({source:node.id},function(err,targetList){
	    								var targetIds = _.pluck(targetList,"target");
	    								Node.all({where : {id: {inq:targetIds},group:currentAttr.group,isChild:{nin:["false"]}}},function(err,attrOfNode){
		    							//db.nodes.find({id: { $in: _.pluck(targetList,"target") },group:currentAttr.group},function(err,attrOfNode){
		    								async.each(attrOfNode,function(attrNode,cbattrNode){


		    									//currentAttr.validate(attrNode)
		    									//console.log(currentAttr.validate);


		    									if(_.isUndefined(currentAttr.validate) || (currentAttr.validate(attrNode) === true)){
			    									if(currentAttr.slot ==1){
			    										attributesSlot1.push(parsersLib.removeSpecialChar(currentAttr.title(attrNode)));
			    									}
			    									else{
			    										attributesSlot2.push(parsersLib.removeSpecialChar(currentAttr.title(attrNode)));
			    									}
			    									//Link.update({where : {source: attrNode.id, target:{nin:[node.id]}}},{source:node.id},function(err,targetList){
			    									//console.log("TESTTTTTT");
			    									//db.links.update({source: attrNode.id, target:{$ne:node.id}},{$set: {source:node.id}},{ multi: true },function(err,linkUp){
			    									//	db.links.update({target: attrNode.id, source:{$ne:node.id}},{$set: {target:node.id}},{ multi: true },cbattrNode);
				    									


			    										async.parallel([
														    function(cbPar1){ 
														    	Link.all({where : {source: attrNode.id, target:{ nin:[node.id]}}},function(err,targetList){
						    										async.each(targetList,function(target,cbTarget){
						    											target.updateAttribute('source', node.id, cbTarget);
						    										},cbPar1);				
						    									});
														    },
														    function(cbPar2){
														    	Link.all({where : {target: attrNode.id, source:{ nin:[node.id]}}},function(err,targetList){
						    										async.each(targetList,function(target,cbTarget){
						    											target.updateAttribute('target', node.id, cbTarget);
						    										},cbPar2);				
						    									});
														    }
														], cbattrNode);

				    									



			    									//});
		    									}
		    									else{
		    										cbattrNode();
		    									}
		    								},cbAttrList);
	
		    							});
		    						});
	    						},function(){
	    							var content = "";

	    							if(attributesSlot1.length > 100){
	    								attributesSlot1 = attributesSlot1.slice(0, 100);
	    								attributesSlot1.push("...");
	    							}

	    							if(attributesSlot2.length > 100){
	    								attributesSlot2 = attributesSlot2.slice(0, 100);
	    								attributesSlot2.push("...");
	    							}


	    							if(attributesSlot1.length > 0){
	    								content = '|'+attributesSlot1.join('\\l')+'\\l';
	    							}
	    							if(attributesSlot2.length > 0){
	    								content = content+'|'+attributesSlot2.join('\\l')+'\\l';
	    							}

	    							if(_.isUndefined(_.findWhere(classList, {id: node.id}))){
		    							//xmi.push(generateXMI(node,attributesSlot1,attributesSlot2));
		    							classList.push({id:node.id,name:node.name,group:node.group,rootParent:node.rootParent,rootParentId:node.rootParentId, data:{label:'{&laquo;'+currentParser.stereotype+'»\\n'+parsersLib.removeSpecialChar(currentParser.title(node))+content+'}',"shape":"record","style":"filled","fillcolor":currentParser.color}});
		    						}
		    						setImmediate(function() { cbNodeUpdt() });	
		    						//cbNodeUpdt()
	    						});
    						}
    						else{
    							var content = "";
    							if(_.isUndefined(_.findWhere(classList, {id: node.id}))){
	    							//xmi.push(generateXMI(node,attributesSlot1,attributesSlot2));
    								classList.push({id:node.id,data:{label:'{&laquo;'+currentParser.stereotype+'»\\n'+parsersLib.removeSpecialChar(currentParser.title(node))+content+'}',"shape":"record","style":"filled","fillcolor":currentParser.color}});
		    					}
		    					setImmediate(function() { cbNodeUpdt() });
    						}
	    				},function(){
	    					cbParsers();
	    				});
    				}else{
    					log.info('No nodes to parse for ',currentParser.stereotype);
    					setImmediate(function() { cbParsers() });
    				}	  				
	    		});


    		}, function(err) {
    			log.info('## Priority done:'+currentPriority);
				parsersLib.errorHandler(err);


				
				

				setImmediate(function() { cbPriorities() });

				//cbPriorities();
			});

		},function(err) {
			parsersLib.errorHandler(err);
			log.info('## All Plugin executed');


			Link.all({where : { target: { inq: nodesUsed } ,  source: { inq: nodesUsed } }},function(err,newLinks){
			//db.links.find({ $and: [{ target: { $in: nodesUsed } }, { source: { $in: nodesUsed } }]  },function(err,newLinks){

				//_.each(newLinks,function(link){
					//xmi.push(generateLink(link.source,link.target));
				//});
				
				//fs.writeFile("app/data/classDiagram.xmi", generateDoc(xmi.join("")), function(err) {


					cbProcessList(err, classList,newLinks);
				//});
				

				
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
	                      .replace('\n',"")
	                      .replace(/[`~!@$%^&*|+?;'"\{\}<>]/gi, '');
	                      //.replace(/[`~!@#$%^&*()_|+\-=?;'",.<>\\\/]/gi, '');



            }


            if(str.length> 3000){
            	str.substring(0,3000);
            }

            str = encodeURI(str).replace(/%20/g,' ');

            
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


function generateXMI(node,attrs,funcs){
	var xmi = "";
	xmi += "<UML:Class xmi.id = '"+node.id+"' name = '"+node.name+"'><UML:Classifier.feature>";
	_.each(attrs,function(attr){
		xmi += generateAttr(attr);
	});
	_.each(funcs,function(func){
		xmi += generateFunc(func);
	});
	xmi += "</UML:Classifier.feature></UML:Class>";
	return xmi;
}

function generateAttr(name){
	return "<UML:Attribute name = '"+name+"'><UML:StructuralFeature.type><UML:DataType href = 'http://argouml.org/profiles/uml14/default-uml14.xmi#-84-17--56-5-43645a83:11466542d86:-8000:000000000000087C'/></UML:StructuralFeature.type></UML:Attribute>";
}

function generateFunc(name){
	return "<UML:Operation name = '"+name+"' visibility = 'public'></UML:Operation>";
}

function generateDoc(data){
	var xmi ="";
	xmi += "<?xml version = '1.0' encoding = 'UTF-8' ?><XMI xmi.version = '1.2' xmlns:UML = 'org.omg.xmi.namespace.UML' timestamp = 'Wed Mar 04 10:33:41 EST 2015'><XMI.header><XMI.documentation><XMI.exporter>ArgoUML (using Netbeans XMI Writer version 1.0)</XMI.exporter><XMI.exporterVersion>0.34(6) revised on $Date: 2010-01-11 22:20:14 +0100 (Mon, 11 Jan 2010) $ </XMI.exporterVersion></XMI.documentation><XMI.metamodel xmi.name='UML' xmi.version='1.4'/></XMI.header>  <XMI.content><UML:Model name = 'untitledModel' isSpecification = 'false' isRoot = 'false' isLeaf = 'false' isAbstract = 'false'><UML:Namespace.ownedElement>";
    xmi += data;
    xmi +="</UML:Namespace.ownedElement></UML:Model></XMI.content></XMI>";
    return xmi;
}

function generateLink(id1,id2){
	var link = "<UML:Association name = '' isSpecification = 'false' isRoot = 'false' isLeaf = 'false' isAbstract = 'false'><UML:Association.connection><UML:AssociationEnd visibility = 'public' isSpecification = 'false' isNavigable = 'false' ordering = 'unordered' aggregation = 'none' targetScope = 'instance' changeability = 'changeable'><UML:AssociationEnd.participant><UML:Class xmi.idref = '"+id1+"'/></UML:AssociationEnd.participant></UML:AssociationEnd><UML:AssociationEnd visibility = 'public' isSpecification = 'false' isNavigable = 'true' ordering = 'unordered' aggregation = 'none' targetScope = 'instance' changeability = 'changeable'><UML:AssociationEnd.participant><UML:Class xmi.idref = '"+id2+"'/></UML:AssociationEnd.participant></UML:AssociationEnd></UML:Association.connection></UML:Association>";

    return link;
}