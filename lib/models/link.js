module.exports = function (schema) {
    var Link = 	  schema.define("Link", {
						  source: Number,
						  target: Number,
						  relVar: {
						    type: String,
						    default: ""
						  },
						  type: {
						    type: String,
						    default: ""
						  },
						  style: {
						  	type: String,
						  	default: ""
						  }
			});
 
    return Link;
};

