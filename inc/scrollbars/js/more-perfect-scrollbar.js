(function($){
	$.fn.morePerfectScrollbar = function(){
		return $(this).each(function(){
			if(typeof $(this).data("morePerfectScrollbarInitialized") != "undefined" || typeof $.fn.perfectScrollbar == "undefined")
				return;

			$(this).data("morePerfectScrollbarInitialized", true);

			var thisArea = $(this).css({
				overflow: "hidden"
			});
			if(thisArea.css("position") == "static"){
				thisArea.css("position", "relative");
			}

			if(thisArea.is("body")){
				thisArea.css("height", "100%");
				thisArea.parent().css("height", "100%");
			}

			var helper = thisArea.children(".ps-scroll-helper");
			if(helper.length == 0 || helper.length > 1)
				helper = thisArea.wrapInner('<div class="ps-scroll-helper"></div>').children(".ps-scroll-helper");

			thisArea.perfectScrollbar({
				wheelSpeed: 0.4,
				wheelPropagation: true
			});

			thisArea.add(helper).onElementResize(function(){
				thisArea.perfectScrollbar("update");
			});

			//elements appended to this scrollable will now go to the helper element and refresh the scrollbar
			var c = thisArea.get(0);
			c.__appendChild = c.appendChild;
			c.appendChild = function(){
			     c.__appendChild.apply(helper.get(0), arguments); 
			     thisArea.perfectScrollbar("update");
			}
		});
	}
	$(function(){
		$(".scrollable").morePerfectScrollbar();
	});
})(jQuery)