(function($){
	if($.support.transition) {
		$.fn.origFadeOut = $.fn.fadeOut;
		$.fn.fadeOut = function(duration, complete){
			if(typeof duration == "function"){
				complete = duration;
				duration = 400;
			}
			if(typeof duration == "object"){
				return $.fn.origFadeOut.apply(this, arguments);
			}
			var def = $.Deferred();
			var elems = $(this).length;
			var ret = $(this).each(function(){
				$(this).transit({
					opacity: 0
				}, duration, function(){
					$(this).css({
						"opacity": ""
					}).hide();
					
					if(typeof complete == "function")
						complete.apply(this, arguments);

					elems--;
					if(elems == 0)
						def.resolve();
				})
			});
			ret.promise = def.promise;
			return ret;
		}
		$.fn.origFadeIn = $.fn.fadeIn;
		$.fn.fadeIn = function(duration, complete){
			if(typeof duration == "function"){
				complete = duration;
				duration = 400;
			}
			if(typeof duration == "object"){
				return $.fn.origFadeIn.apply(this, arguments);
			}
			var def = $.Deferred();
			var elems = $(this).length;
			var ret = $(this).each(function(){
				$(this).show().css({
					opacity: 0
				}).transit({
					opacity: 1
				}, duration, function(){
					$(this).css({
						"opacity": ""
					});
					
					if(typeof complete == "function")
						complete.apply(this, arguments);

					elems--;
					if(elems == 0)
						def.resolve();
				})
			});
			ret.promise = def.promise;
			return ret;
		}
	}
})(jQuery)