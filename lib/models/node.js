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
						  data: {type: String},
						  time: {
						    type: Number,
						    default: Date.now
						  },
						  hierarchyFile: {type: Number, default: 1},
						  hierarchyElement: {type: Number, default: 1},
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
						  childRange: {type: String},
						  filterValue: {type: Number, default: 1},
						  isChild: {type: String, default: "false"},
						  mode: {type: Number, default: 1},
						  visElem: {type: Number, default: 0},
						  modeWeight : {type: String, default: ""},
						  newExp: {type: String, default: ""},
						  cssClass: {type: String, default: ""}

			});
 
    return Node;
};

