(function($){
	$(document).on("infinite-loaded contentLoad", function(e, post){
		if(post){
			post.find($.lazyLoadXT.selector).lazyLoadXT();
		}
	});
})(jQuery)