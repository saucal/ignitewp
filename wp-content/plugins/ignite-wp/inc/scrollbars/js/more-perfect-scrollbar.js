(function($){
	$.fn.morePerfectScrollbar = function(){
		return $(this).each(function(){
			if(typeof $(this).data("morePerfectScrollbarInitialized") != "undefined" || typeof $.fn.perfectScrollbar == "undefined")
				return;

			$(this).data("morePerfectScrollbarInitialized", true);

			var thisArea = $(this);
			var thisAreaReal = thisArea;
			var thisAreaScrollEvent = thisArea;

			if(thisArea.is("body")){
				thisArea.css({
					"height": "100%",
					"position": "relative"
				});
				thisArea.parent().css("height", "100%");
				thisArea = thisArea.wrapInner('<div class="body-scroll-helper"></div>').children(".body-scroll-helper").css({
					"position": "absolute",
					"height": "100%",
					"width": "100%",
					"left": 0,
					"top": 0
				});
				thisAreaScrollEvent = $(window);
			}

			thisArea.css({
				overflow: "hidden"
			});
			if(thisArea.css("position") == "static"){
				thisArea.css("position", "relative");
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
			var c = thisAreaReal.get(0);
			var helperElement = helper.get(0);

			var patchAppendChild = function(el) {
				if(el.appendChild) {
					var oldAppendChild = el.appendChild;
					el.appendChild = function(){
						patchAppendChild(arguments[0]);
						var ret = oldAppendChild.apply(this, arguments);
						thisArea.perfectScrollbar("update");
						return ret;
					}
				}
				if(el.removeChild) {
					var oldRemoveChild = el.removeChild;
					el.removeChild = function(){
						var ret = oldRemoveChild.apply(this, arguments);
						thisArea.perfectScrollbar("update");
						return ret;
					}
				}
			}

			c.__appendChild = c.appendChild;
			c.appendChild = function(){
				var ret = c.__appendChild.apply(helperElement, arguments);
				thisArea.perfectScrollbar("update");
				return ret;
			}
			c.__removeChild = c.removeChild;
			c.removeChild = function(){
				var ret = c.__removeChild.apply(helperElement, arguments);
				thisArea.perfectScrollbar("update");
				return ret;
			}
			patchAppendChild(c)

			var d = thisAreaScrollEvent.get(0);
			d.__pageYOffset = d.pageYOffset;
			Object.defineProperty(d, 'pageYOffset', {
			  get: function() { return thisArea.scrollTop(); },
			  set: function(newValue) { thisArea.scrollTop(newValue); }
			});
			d.__pageXOffset = d.pageXOffset;
			Object.defineProperty(d, 'pageXOffset', {
			  get: function() { return thisArea.scrollLeft(); },
			  set: function(newValue) { thisArea.scrollLeft(newValue); }
			});

			if(d.scrollTo || d.scroll) {
				//bypass scroll settings to the actual scrolling area
				d.__scrollTo = d.scrollTo;
				d.__scroll = d.scroll;
				var prevScrollX = thisArea.scrollLeft();
				var prevScrollY = thisArea.scrollTop(); 
				d.scroll = d.scrollTo = function() {
					var thisAreaElem = thisArea.get(0);
					if(prevScrollX != arguments[0]) {
						thisArea.scrollLeft(arguments[0]);
					}
					if(prevScrollY != arguments[1]){
						thisArea.scrollTop(arguments[1]);
					}
					prevScrollX = thisArea.scrollLeft();
					prevScrollY = thisArea.scrollTop(); 
					d.__scroll.apply(this, arguments);
					return d;
				}
			}

			thisArea.on("scroll", function(){
				$(window).trigger("scroll");
			})
		});
	}
	$(".scrollable").morePerfectScrollbar();
})(jQuery)