var _ = require('underscore')._;
var async = require("async");


var parsersHelper = require("../parsersHelper");


module.exports = [{	    type: "ast",
						id: "jQuery1",
						description: "$.ajax()",
						analysis: "func2f:ajax",
						active: true,
	                    query:{callee:{object:{name:"$"},property:{name:"ajax"}}},
	                    link: {"dir":"back","arrowtail":"diamond"},
	                    group: "ajax",
	                    parse:function(node,parent){
	                    	var newNode = {};
	                    	newNode.name = parent.name + "::" + parsersHelper.getCount("ajax");	
	                    	newNode.data = JSON.stringify(node);
	                    	return newNode;
	                    },
	                    after: function(node,parent,cb){
	                    	var url = "";
	                    	var data = JSON.parse(node.data);





	                    	if(!_.isUndefined(data.arguments) && !_.isUndefined(data.arguments[0]) && !_.isUndefined(data.arguments[0].properties)){
	                    		parsersHelper.getAjaxUrl(data.arguments[0].properties,node,function(ajaxUrl){	                    			 
									if(!_.isUndefined(ajaxUrl)){
										//console.log(ajaxUrl);
										parsersHelper.addNode({name:ajaxUrl},node,{type:{"label":"AJAX"}},function(){	       
							        		cb();	
										});	
									}
									else{
										cb();
									}
	                    		});	
							}
							else{
								cb();
							}

	                    }
	                },
	                ,
	                 {	
	                	type: "ast",
	                	id: "jQuery2",
	                	description: "$.post()",
	                	analysis: "func2f:ajax",
	                	active: true,
	                    query:{callee:{object:{name:"$"},property:{name:"post"}}},
	                    link: {"dir":"back","arrowtail":"diamond"},
	                    group: "ajax",
	                    parse: function(node,parent){
	                    	var newNode = {};
	                    	newNode.data ="";
	                    	if(!_.isUndefined(node)){
		                    	newNode.data = JSON.stringify(node);
		                    }
		                    	newNode.name = parent.name + "::" + parsersHelper.getCount("post");	

	                    	return newNode;
	                    },
	                    after: function(node,parent,cb){
	                    	var url = "";
	                    	var data = JSON.parse(node.data);


	                    	if(!_.isUndefined(data.arguments) && !_.isUndefined(data.arguments[1]) && !_.isUndefined(data.arguments[1].properties)){
	                    		parsersHelper.getAjaxUrl(data.arguments[1].properties,node,function(ajaxUrl){	                    			 
									if(!_.isUndefined(ajaxUrl)){
										parsersHelper.addNode({name:ajaxUrl},node,{type:{"label":"POST"}},function(){	       
							        		cb();	
										});	
									}
									else{
										cb();
									}
	                    		});	
							}
							else{
								cb();
							}

	                    }
	                },
	                {	
	                	type: "ast",
	                	id: "jQuery3",
	                	description: "$.get()",
	                	analysis: "func2f:ajax",
	                	active: true,
	                    query:{callee:{object:{name:"$"},property:{name:"get"}}},
	                    link: {"dir":"back","arrowtail":"diamond"},
	                    group: "ajax",
	                    /*name: function(node,parent){


	                        var name = node.arguments[0].value;
	                    	name = parsersHelper.correctPathSync(name,parent);


	                    	if(_.isUndefined(name)){
	                    		name = parent.name+"::"+parsersHelper.getCount("get");
	                    	}

	                        return name;
	                    },*/
	                    parse: function(node,parent){
	                    	var newNode = {};
	                    	newNode.data = JSON.stringify(node);
	                    	newNode.name = parent.name + "::" + parsersHelper.getCount("post");	
	                    	return newNode;
	                    },
	                    after: function(node,parent,cb){
	                    	var data = JSON.parse(node.data);


	                    	
								

	                    		

	                    		if(data.arguments[0].type === "Literal" && !_.isUndefined(url)){
	                    			var url = data.arguments[0].value;
		                    		//url = parsersHelper.correctPathSync(url,parent);

		                    		parsersHelper.correctPath(url,parent,function(err,url){



			                    		parsersHelper.addNode({name:url},node,{type:{"label":"GET"}},function(){	           
								        	cb();	
										});	 
									});
                    			}
                    			else{
                    				cb();
                    			}
							
	                    },
	                    rawName: ['id.name']
	                },
	                {	
	                	type: "ast",
	                	id: "jQuery4",
	                	description: "$.getScript()",
	                	analysis: "func2f:ajax",
	                	active: true,
	                    query:{callee:{object:{name:"$"},property:{name:"getScript"}}},
	                    link: {"dir":"back","arrowtail":"diamond"},
	                    group: "ajax",
	                    name: function(node,parent){
	                    	var name = node.arguments[0].value;

	                    	if(_.isUndefined(name)){
	                    		name = parent.name+"::"+parsersHelper.getCount("getScript");
	                    	}
	                        return name;
	                    },
	                    rawName: ['id.name']
	                },
	                 {	
	                 	type: "ast",
	                 	id: "jQuery5",
	                 	description: "$.getJSON()",
	                 	analysis: "func2f:ajax",
	                	active: true,
	                    query:{callee:{object:{name:"$"},property:{name:"getJSON"}}},
	                    link: {"dir":"back","arrowtail":"diamond"},
	                    group: "ajax",
	                    name: function(node,parent){
	                    	var name = node.arguments[0].value;

	                    	if(_.isUndefined(name)){
	                    		name = parent.name+"::"+parsersHelper.getCount("getJSON");
	                    	}
	                        return name;
	                    },
	                    rawName: ['id.name']
	                },
	                {	
	                 	type: "ast",
	                	active: true,
	                	id: "jQuery6",
	                	description: "$.load()",
	                	analysis: "func2f:ajax",
	                    query:{callee:{object:{callee:{name:"$"}},property:{name:"load"}}},
	                    link: {"dir":"back","arrowtail":"diamond"},
	                    group: "ajax",
	                    name: function(node,parent){

	                    	return parsersHelper.getCount("ajax");
	                    },
	                    parse: function(node,parent){
	                    	var newNode = {};
	                    	newNode.data = JSON.stringify(node);
	                    	newNode.rawName = "";
	                    	return newNode;
	                    },
	                    after: function(node,parent,cb){
	                    	var data = JSON.parse(node.data);
                    		var url = data.arguments[0].value;

                    		if(!_.isUndefined(url)){
	                    		parsersHelper.correctPath(url,parent,function(err,url){
		                    		parsersHelper.addNode({name:url},node,{reverse:true,type:{"label":"LOAD"}},function(err,nodeadded){
							        	cb();	
									});	
								});   
							}
							else{
								cb();
							}                 		
	                    }
	                }];

