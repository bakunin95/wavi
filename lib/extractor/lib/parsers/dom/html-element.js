var parsersHelper = require("../parsersHelper");
var      _ = require('underscore')._;


module.exports = [ {	active: true,
						id: "html-element1",
						tag:['img','iframe','frame','video','audio'],
						group: "html-element",
						link: {"dir":"back","arrowtail":"diamond"},
						name: function(elem,parent){
							var tag = elem[0].tagName;

							if(!_.isUndefined(elem.attr("src"))){
								return parsersHelper.correctPathSync(elem.attr("src"),parent);
							}
							else{
								return parent.name + "::" + parsersHelper.getCount(tag);
							}

						},
						rawType: function(elem,parent){
							
							var type = elem[0].tagName;
							switch(type){
								case "img":
									type= "image";
								break;
							}

							return type;

						},
						rawValue: function(elem,parent){
							if(!_.isUndefined(elem.attr("src"))){
								return parsersHelper.correctPathSync(elem.attr("src"),parent);
							}
							else{
								return "";
							}
						},
						rawName: function(elem,parent){
							//parsersHelper.getCount(tag);
							var elemName = parsersHelper.findFirstExistingAttr(elem,['name','id']);

							if(elemName === ""){
								elemName = elem[0].tagName;
								switch(elemName){
									case "img":
										elemName= "image";
									break;
								}

							}
							return elemName;
						
						}
					},
					{
						active: true,
						id: "html-element2",
						tag:['svg','canvas'],
						group: "html-element",
						link: {"dir":"back","arrowtail":"diamond"},
						name: ['name','id'],
						rawName: ['name','id'],
						rawType: function(elem,parent){

							var type = elem[0].tagName;

							return type;
						}
					},
					{
						active: true,
						id: "html-element3",
						tag:['applet'],
						group: "html-element",
						link: {"dir":"back","arrowtail":"diamond"},
						name: ['code','name'],
						rawName: ['code','name'],
						rawType: "applet"
					}];


