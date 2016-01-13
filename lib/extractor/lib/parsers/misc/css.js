var async = require("async");
var parsersHelper = require("../parsersHelper");
var cssparse = require("css").parse,
	_ = require('underscore')._;

function escapeHTML(text){
       var chr = { '"': '', '&': '', '<': '', '>': '', '@': '' };
       function abc(a){
          return chr[a];
       }
       return text.replace(/[\"&<>]/g, abc);
}

module.exports = [  {         
                        active: true,
                        priority:50,
                        group:["css","css-markup"],
                        parse: function(node,data,cb){


                        	try{


                        		if(node.group === "css-markup"){
                        			data = node.data;
                        		}

								if(data){
									var ast = cssparse(data);
									var rules = [];
									async.each(ast.stylesheet.rules, function(rule,cbVar){	
										


									  if(rule.selectors !== null && _.isUndefined(rule.selectors) == false){
										var rawName = escapeHTML(rule.selectors.join(" "));									  
									  	parsersHelper.addNode({"name":node.name+"::"+rawName,rawName:rawName, group:"css-rule"},node,{arrowHead:'diamond'},function(err){
											cbVar();
										});
									  }
									  else{
									  	cbVar();
									  }			  

									  										    		
									},function(err){
										cb();

									});	 
								}
								else{
									cb();
								}
							}catch(e){
								cb();
							}
                        }
                    }];
