module.exports = function (schema) {
    var model = 	  schema.define("Def", {
    						  file: String,
							  file_id: Number,
							  def_id: Number,
							  file_type: String,
							  def: {
							    type: String,
							    default: ""
							  },
							  def_full: {
							    type: String,
							    default: ""
							  },
							  def_alias: String,
							  def_group: {
							    type: String,
							    default: ""
							  },
							  alias: String,
							  //visibility: String,
							  param_number: Number,
							  param_list: String,//toremove
							  parsed_by: String,
							  assignments: {
							    type: String,
							    default: ""
							  },
							  loc: String,
							  scope: String,
							  range: String,
							  pointerToDef: String,
							  pointerLoc: String,
							  isExtendOrProto: Boolean
			});
 
    return model;
};



