(function($){
	window.newElem = function(tag, _class, _opts){
		if(typeof _class == "object"){
			_opts = _class;
			_class = undefined;
		}
		var def = {};
		if(typeof _class != "undefined") {
			def = {
				"class": _class
			};
		}
		var opts = $.extend(true, {}, def);
		opts = $.extend(true, opts, _opts);
		return $("<"+tag+"/>", opts);
	}

	window.newDiv = function(_class, divOpts){
		return newElem("div", _class, divOpts);
    }
})(jQuery)