var parsersHelper = require("../parsersHelper");
var _ = require('underscore')._;

module.exports = [{		active: true,
						id: "form",
						tag:['form'],
						group: "form",
						name: ['name','id'],
						link: {"dir":"back","arrowtail":"diamond"},
						name: function(elem,parent){
							var elemName = parsersHelper.findFirstExistingAttr(elem,['name','id']);
							if(elemName == ""){
								elemName = parsersHelper.getCount("form");
							}
							return parent.name + "::" + elemName;
						},
						rawName: ['name','id'],
						analysis: "f2f:form"
					},
					{	active: true,
						id: "form-element",
						tag:['input','button','select','textarea','fieldset','legend','optgroup','option','datalist','keygen','output'],
						group: "form-element",
						link: {"dir":"back","arrowtail":"diamond"},
						name: function(elem,parent){
							var tag = elem[0].tagName;
							var elemName = parsersHelper.findFirstExistingAttr(elem,['name','id']);
							if(elemName === "" || _.isUndefined(elemName) || elemName === null){
								elemName = parsersHelper.getCount(tag);
							}
							return parent.name + "::" + elemName;
						},
						rawName: function(elem,parent){
							var tag = elem[0].tagName;
							var elemName = parsersHelper.findFirstExistingAttr(elem,['name','id']);

							if(elemName === "" || _.isUndefined(elemName) || elemName === null){
								elemName = "_"+parsersHelper.getCount(tag);
							}
							return elemName;
						},
						rawType: function(elem,parent){
							var tag = elem[0].tagName;
							if(!_.isUndefined(elem) && !_.isUndefined(elem.attr("type"))){
								tag += " "+elem.attr("type");
							}
							return tag;
						},
						rawValue: function(elem,parent){
							if(!_.isUndefined(elem) && !_.isUndefined(elem.attr("value"))){
								return elem.attr("value");
							}
							else{
								return "";
							}
						}

					}];