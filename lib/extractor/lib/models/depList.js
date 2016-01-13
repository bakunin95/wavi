module.exports = function (schema) {
    var model = 	  schema.define("DepList", {
    						  file_id: Number,
							  child_id: Number,
							  order: Number,
							  variable: String
			});
 
    return model;
};