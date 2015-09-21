(function($){
	$(document).on("click", "a.load-comments", function(e) {
		e.preventDefault();
		e.stopPropagation();
		var prev = $("#comments-template");
		if(prev.length > 0) {
			prev.trigger("remove-comments");
		}

		var insterBefore = $(this);
		var templateCont = insterBefore.siblings(".comments-template-container");
		if(templateCont.length == 0) {
			insterBefore = $(this).parent();
			templateCont = insterBefore.siblings(".comments-template-container");
		}

		var tID = $(this).data("thread-id");
		var template = typeof wp_comment_threads[tID] != "undefined" ? wp_comment_threads[tID] : false;
		if(!template)
			return;

		template = $(template);

		template.find("#commentform").attr("data-thread-id", tID).data("thread-id", tID);

		template.hide().insertBefore(insterBefore).slideDown();

		template.on("remove-comments", function() {
			insterBefore.show();
			var scrollTop = $(this).getScrollingParent().scrollTop(); 
			if($(this).offset().top < scrollTop) {
				$(this).remove();
				$(this).getScrollingParent().scrollTop(scrollTop - $(this).outerHeight());
			} else {
				$(this).remove();
			}
		})

		insterBefore.hide();
	});

	$(document).on("submit", "#commentform", function(e) {
		console.log(e);
		e.preventDefault();
		var thisForm = $(this);
		$.ajax({
			type: "POST",
			url: $(this).attr("action"),
			data: $(this).serialize()
		}).promise().done(function(data){
			var html = $(data).html();

			if(typeof wp_comment_threads == "undefined")
				wp_comment_threads = {};

			wp_comment_threads[thisForm.data("thread-id")] = html;

			thisForm.closest("#comments-template").html($(html).html());
		});
		
	});
})(jQuery);