module.exports = function (schema) {
    var model = 	  schema.define("LinkChild", {
						  id: Number,
						  childs: Object,
						  allChilds: String
			});
 
    return model;
};