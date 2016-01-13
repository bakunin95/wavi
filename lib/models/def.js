module.exports = function (schema) {
    var model = 	  schema.define("Def", {
						  parentid: Number,
						  nodeid: Number,
						  func: {
						    type: String,
						    default: ""
						  }
			});
 
    return model;
};



