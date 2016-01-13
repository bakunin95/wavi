module.exports = function (schema) {
    var model = 	  schema.define("Call", {
						  parentid: Number,
						  nodeid: Number,
						  obj: {
						    type: String,
						    default: ""
						  },
						  func: {
						    type: String,
						    default: ""
						  }
			});
 
    return model;
};

