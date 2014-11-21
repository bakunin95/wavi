var _ = require('underscore')._;

var libGroups = module.exports = {
	/*	
	1: html
	2: javascript externe
	3: css externe
	4: javascript interne
	5: liens externe
	6: ancres HTML (#Pages)
	7: liens courriel
	8: css interne
	9: requête ajax
	10: javascript externe (mort)
	11: javascript externe (lien)
	12: css externe (mort)
	13: css externe (lien)
	14: PHP
	15: Autre
	16: Template
	*/


	groups: ["","html","javascript externe","css externe","javascript interne","liens externe","ancres HTML (#pages)","liens courriel","css interne","requête ajax","javascript externe (mort)","javascript externe (liens)","css externe (mort)","css externe (liens)","PHP","Autre","Templates"],
	isExistingHTML: function(group){
		return _.contains([1], group);
	},
	isExistingJavaScript: function(group){
		return _.contains([2], group);
	},
	isExistingCSS: function(group){
		return _.contains([3], group);
	}
};