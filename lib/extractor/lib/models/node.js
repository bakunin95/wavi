module.exports = function (schema) {
    var Node = 	  schema.define("Node", {
						  name: {type: String},
						  rawType: {type: String},
						  rawName: {type: String},
						  rawValue: {type: String},
						  visibility: {type: String},
						  type: {type: String},
						  rootParent: {type: String},
						  rootParentId: {type: Number},
						  rootParentType: {type: String},
						  loc: {type: String},
						  group: {type: String},
						  exist: {type: Boolean},
						 // data: {type: String},

						  hierarchyFile: Number,
						  hierarchyElement: Number,
						  time: {
						    type: Number,
						    default: Date.now
						  },
						  cluster: {type: String},
						  file: {type: String},
						  folder: {type: String},
						  alias: {type: String},
						  parsedBy: {type: String},
						  assignments: {type: String, default: ""},
						  groupColor: {type: String},
						  groupText: {type: String},
						  groupFoci: {type: String},
						  scope: {type: String},
						  fullScope: {type: String},
						  range: {type: String},
						  callRange: {type: String},
						  childRange: {type: String}

			});
 
    return Node;
};

