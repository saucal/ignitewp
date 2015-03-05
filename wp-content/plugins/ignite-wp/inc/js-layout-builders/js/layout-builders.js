(function($){
	window.newElem = function(tag, _class, opts){
		if(typeof _class == "object"){
			opts = _class;
			_class = undefined;
		}
		if(typeof _class == "undefined") _class = "";
		opts = $.extend(true, {
			"class": _class
		}, opts);
		return $("<"+tag+"/>", opts);
	}

	window.newDiv = function(_class, divOpts){
		return newElem("div", _class, divOpts);
    }
})(jQuery)