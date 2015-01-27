var parsersHelper = module.exports = {
	reduceLength: function(name,maxLength){
		if(typeof name == "string" && name.length > maxLength){
			return name.substr(0,maxLength);

		}
		else{
			return name;
		}
	}
};
