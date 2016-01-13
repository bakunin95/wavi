module.exports = function (schema) {
    var Link = 	  schema.define("Link", {
						  source: Number,
						  target: Number,
						  group: {
						    type: Number,
						    default: 2
						  },
						  relVar: {
						    type: String,
						    default: ""
						  },
						  type: {
						    type: String,
						    default: ""
						  }
			});
 
    return Link;
};

