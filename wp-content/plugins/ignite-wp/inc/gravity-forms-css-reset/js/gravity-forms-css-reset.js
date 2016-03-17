(function($){
	$(document).on("gform_page_loaded gform_post_render", function(e, form_id){
		var scope = $("#gform_wrapper_"+form_id);
		scope.find(".gform_footer input.button, .gform_footer input[type=submit]").each(function(){
			var thisBtn = $(this);
			var thisForm = thisBtn.parents(".gform_wrapper");

			var newBtn = $("<button/>", {
				"type": "submit",
				"id": thisBtn.attr("id"),
				"class": thisBtn.attr("class"),
				"tabindex": thisBtn.attr("tabindex"),
				"onclick": thisBtn.attr("onclick")
			}).text(thisBtn.attr("value")).insertAfter(thisBtn);
			thisBtn.detach();
		})
	})
	$(document).on("contentReady", function(){
		if(gformInitDatepicker) gformInitDatepicker();
	});
})(jQuery)