var requireDir = require('require-dir'),
			 _ = require('underscore')._,
	     	async = require("async"),
	     	fs = require('graceful-fs');    

var parsersLib = module.exports = {
    processList: function(Node,Link,cbProcessList){

    	var generateXMIfile = false;
    	var parsersList = requireDir("../parsers");
    	parsersList = _.where(parsersList,{"active": true});
    	var priorityList = _.uniq(_.sortBy(_.pluck(parsersList, 'priority')),true);

    	var counter = 0;
    	var maxLenght = 50;
    	var classList = [];
    	var xmi = [];
    	var nodesUsed = [];
    	var report = "";

    	Node.all({where : {mode:1}},function(err,nodesList){
    		async.each(nodesList, function(node,cbNodeUpdt){
    			
    				nodesUsed.push(node.id);
	    			var currentParser = _.findWhere(parsersList,{group:node.group});

	    			if(_.isUndefined(currentParser)){
	    				currentParser = _.findWhere(parsersList,{group:"undefined"});
	    			}

	    			var attributesSlot1 = [];
	    			var attributesSlot2 = [];
	    			Link.all({where : {source:node.id}},function(err,targetList){
						var targetIds = _.pluck(targetList,"target");
						Node.all({where : {id: {inq:targetIds},mode:2}},function(err,attrOfNode){
							async.each(attrOfNode,function(attrNode,cbattrNode){

								var currentAttr = _.findWhere(parsersList,{group:attrNode.group});

				    			if(_.isUndefined(currentAttr)){
				    				currentAttr = _.findWhere(parsersList,{group:"undefined"});
				    			}
				    			

								if(_.isUndefined(currentAttr.validate) || (currentAttr.validate(attrNode) === true)){
									if(currentAttr.slot !== 2 ){
										attributesSlot1.push(parsersLib.removeSpecialChar(currentAttr.title(attrNode)));
									}
									else{
										attributesSlot2.push(parsersLib.removeSpecialChar(currentAttr.title(attrNode)));
									}
									cbattrNode();		    									
								}
								else{
									cbattrNode();
								}
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

    							attributesSlot1.sort();
								attributesSlot2.sort();

								attributesSlot1 = _.unique(attributesSlot1);
								attributesSlot2 = _.unique(attributesSlot2);

    							if(attributesSlot1.length > 0){
    								content = '|'+attributesSlot1.join('\\l')+'\\l';
    							}
    							if(attributesSlot2.length > 0){
    								content = content+'|'+attributesSlot2.join('\\l')+'\\l';
    							}
    							var stereotype = "";
    							if(currentParser.stereotype === "Undefined"){
    								stereotype = node.group.replace("-"," ");
    							}
    							else{
    								stereotype = currentParser.stereotype
    							}

    							classList.push({id:node.id,name:node.name,group:node.group,rootParent:node.rootParent,rootParentId:node.rootParentId, data:{label:'{&laquo;'+stereotype+'»\\n'+parsersLib.removeSpecialChar(currentParser.title(node))+content+'}',"shape":"record","style":"filled","fillcolor":currentParser.color}});
    							cbNodeUpdt();

							});

						});
					});    			
	    		
    		},function(err) {
				parsersLib.errorHandler(err);
				Link.all({where : { target: { inq: nodesUsed } ,  source: { inq: nodesUsed }}},function(err,newLinks){				
					cbProcessList(err, classList,newLinks);									
				});						
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
	                      .replace("[","")
	                      .replace("]","")
	                      .replace(/[`~!$%^&*|?;"\{\}<>]/gi, '');

            }


            if(str.length> 3000){
            	str.substring(0,3000);
            }

            str = encodeURI(str).replace(/%20/g,' ').replace(/%C2%/g,"'");
            str = decodeURI(str);
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