module.exports = function (schema) {
    var model = 	  schema.define("Call", {
						  	  file: String,
							  file_id: Number,
							  file_type: String,
							  call: {
							    type: String,
							    default: ""
							  },
							  call_full: {
							    type: String,
							    default: ""
							  },   
							  found_type: Number,
							  found_count: Number,
							  pointerToDef : String,

							  found_w_scope: Number,
							  found_w_file: Number,
							  found_w_param: Number,
							  found_w_param_less: Number,	  
							  found_w_hierarchy: Number,
							  found_w_experimental: Number,

						      found_intersect: Number,
							  found_union: Number,
							  found_smart: Number,
							  found_vote: Number,                        
							  found_otherpaper: Number,

							   loc: String,
							   callRange: String
							  /*parent: String,
							  declarationLoc: String,
							  address: String,
							  scope: String,
							  full_scope: String,
							  range: String,
							  callRange: String,
							  child_range : String,
							  param_number: Number,
							  param_list: String,
							 
							  alias: String*/

			});
 
    return model;
};

