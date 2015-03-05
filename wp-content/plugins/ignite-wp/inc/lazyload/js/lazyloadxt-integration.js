(function($){
	$(document).on("infinite-loaded contentReady", function(e, post){
		if(post){
			post.find($.lazyLoadXT.selector).lazyLoadXT();
		}
	});
})(jQuery)