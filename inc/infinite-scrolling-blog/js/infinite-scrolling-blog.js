(function($){
	/**
	Viewport Tools
	*/
	$.fn.getBounds = function(margins){
		if(typeof margins == "undefined")
			margins = false;

		var thisEl = $(this); 
		var top = thisEl.offset().top;
		if(margins) {
			top -= parseInt(thisEl.css("margin-top"));
		}
		var height = this.outerHeight(margins);
		var left = thisEl.offset().left;
		if(margins) {
			left -= parseInt(thisEl.css("margin-left"));
		}
		var width = this.outerWidth(margins);
		return {
		  top: top,
		  bottom: top + height,
		  left: left,
		  right: left + width
		}
	}
	$.fn.getViewport = function(){
		var viewportElem = $(this);
		if(viewportElem.is("html"))
			viewportElem = $(window);

		var viewport = {};
		viewport.top = viewportElem.scrollTop();
		viewport.bottom = viewport.top + viewportElem.height();
		viewport.left = viewportElem.scrollLeft();
		viewport.right = viewport.left + viewportElem.width();
		return viewport;
	}
	$.fn.isOnScreen = function(){
		var viewport = {};
		viewport.top = $(this).getScrollingParent().scrollTop();
		viewport.bottom = viewport.top + $(window).height();
		var bounds = {};
		bounds.top = this.offset().top;
		bounds.bottom = bounds.top + this.outerHeight();
		return ((bounds.top <= viewport.bottom) && (bounds.bottom >= viewport.top));
	};
	$.fn.getScrollingParent = function() {
		var scrollingParent = $(this).offsetParent();
		if(scrollingParent.is("html")) {
			//scrollingParent = $(window);
			if(scrollingParent.data("window.patched"))
				return scrollingParent;

			scrollingParent.data("window.patched", true);
			var bubbled = false;
			$(window).on("scroll", function(e){
				if(bubbled)
					return;
				bubbled = true;
				scrollingParent.trigger("scroll");
				bubbled = false;
			});

			var d = scrollingParent.get(0);
			d.__scrollTop = d.scrollTop;
			Object.defineProperty(d, 'scrollTop', {
			  get: function() { return $(window).scrollTop(); },
			  set: function(newValue) { $(window).scrollTop(newValue); }
			});
			d.__scrollLeft = d.scrollLeft;
			Object.defineProperty(d, 'scrollLeft', {
			  get: function() { return $(window).scrollLeft(); },
			  set: function(newValue) { $(window).scrollLeft(newValue); }
			});
		}
		return scrollingParent;
	}
	$.fn.getOffsetFromScrollingParent = function() {
		var thisEl = $(this);
		var elem = thisEl.getBounds(true);
		var viewport = thisEl.getScrollingParent().getViewport();
		return {
			top: elem.top - viewport.top,
			left: elem.left - viewport.left
		}
	}

	/**
	Posts Tools
	*/
	$.fn.getPostId = function(){
		var thisEl = $(this);
		if(thisEl.attr("id").indexOf(infiniteScrollConfig.prefixmenuitemid) === 0) {
			return parseInt(thisEl.attr("id").replace(infiniteScrollConfig.prefixmenuitemid, ""));
		} else if(thisEl.attr("id").indexOf("post-") === 0) {
			return parseInt(thisEl.attr("id").replace("post-", ""));
		} else {
			return 0;
		}
	}
	$.fn.markInSidebar = function(){
		var postscontainer = $(infiniteScrollConfig.selectors.postscontainer);
		if(!postscontainer.is(":visible"))
			return;

		var scrollingParent = postscontainer.getScrollingParent();
		if(scrollingParent.is(":animated"))
			return;

		var id = $(this).getPostId();
		if(id) {
			$(this).addClass('current').siblings().removeClass('current');
			var menuItem = $(infiniteScrollConfig.selectors.sidebaritemscont).children("#"+infiniteScrollConfig.prefixmenuitemid+id);
			menuItem.addClass('current').siblings().removeClass('current');

			var title = menuItem.data("wptitle");
			var permalink = menuItem.data("permalink");
			if(document.URL != permalink){
				var state = {
					blog_post_id: id
				};
				if(window.history.state !== null) {
					window.history.pushState(state, title, permalink);
				} else {
					window.history.replaceState(state, title, permalink);
				}
				document.title = $("title").html(title).text();
			}
		}
	}
	var get_postsid = function(){
		return $(infiniteScrollConfig.selectors.sidebaritemscont).children();
	}
	var getNext = function(curr){
		var postsid = get_postsid();
		var nextIndex = postsid.index($("#"+infiniteScrollConfig.prefixmenuitemid+curr)) + 1;
		if(typeof postsid[nextIndex] != "undefined"){
			return $(postsid[nextIndex]).getPostId();
		} else {
			return false;
		}
	}
	var getPrev = function(curr){
		var postsid = get_postsid();
		var nextIndex = postsid.index($("#"+infiniteScrollConfig.prefixmenuitemid+curr)) - 1;
		if(typeof postsid[nextIndex] != "undefined"){
			return $(postsid[nextIndex]).getPostId();
		} else {
			return false;
		}
	}

	var getPost = function(id, cb){
		console.error("getting-post");
		ajaxGetJSON('get_post_by_id', 'post_id='+ id , function(){
			var json = arguments[1];
			if(typeof json === "object") {
				var menuItem = $(infiniteScrollConfig.selectors.sidebaritemscont).children("#"+infiniteScrollConfig.prefixmenuitemid+id);
				menuItem.each(function(){
					$(this).attr("data-"+"permalink", json.permalink);
					$(this).data("permalink", json.permalink);
					$(this).attr("data-"+"wptitle", json.title_tag);
					$(this).data("wptitle", json.title_tag);
				})
			}			
			var arg = [json];
			return cb.apply(this, arg);
		});
	}

	/**
	Initialization
	*/
	$(document).on("contentReady", function(){
		var blogarea = $(infiniteScrollConfig.selectors.blogarea);
		if(blogarea.data("blog-initialized")) 
			return;

		blogarea.data("blog-initialized", true)
		var postscontainer = $(infiniteScrollConfig.selectors.postscontainer);
		if(postscontainer.css("overflow") == "visible") {
			postscontainer.css("overflow", "hidden")
		}
		var sidebar = $(infiniteScrollConfig.selectors.sidebar);

		var scrollingParent = postscontainer.getScrollingParent();

		/**
		Sidebar Positioning
		*/
		if(sidebar.css("position") == "fixed") {
			//code for when the sidebar is fixed in the screen
		} else if( sidebar.css("position") == "absolute") {
			//code for when the sidebar is absolutely positioned
		} else if( sidebar.css("float") != "none") {
			var originalMargins = {
				top: parseInt(sidebar.css("margin-top")),
				bottom: parseInt(sidebar.css("margin-bottom"))
			}
			var checkHeight = function(){
				/*var minHeight = scrollingParent.height();
				minHeight -= originalMargins.top + originalMargins.bottom;
				if(postscontainer.height() < minHeight) {
					minHeight = postscontainer.height();
				}
				sidebar.css("min-height", minHeight);*/
				var maxHeight = scrollingParent.height();
				maxHeight -= originalMargins.top + originalMargins.bottom;
				sidebar.css("max-height", maxHeight);
			}
			scrollingParent.onElementResize(checkHeight);
			postscontainer.onElementResize(checkHeight);
			checkHeight();

			scrollingParent.on("scroll", function(){
				//console.error("scroll", scrollingParent.get(0));
				if(!blogarea.is(":visible"))
					return;

				var scrollTop = scrollingParent.scrollTop();
				var top = sidebar.getOffsetFromScrollingParent().top;
				var candidate = scrollTop - (top + scrollTop) + originalMargins.top;

				var newMarginTop = candidate;

				if(newMarginTop > originalMargins.top) {
					var sidebarTotalHeightNeeded = newMarginTop + sidebar.outerHeight() + originalMargins.bottom;
					var sidebarMaxHeightAvail = postscontainer.height();
					var overflow = sidebarTotalHeightNeeded - sidebarMaxHeightAvail;
					if(overflow > 0) {
						newMarginTop -= overflow;
					}
				} else {
					newMarginTop = originalMargins.top;
				}
				sidebar.css("margin-top", newMarginTop);
			})
		}

		/**
		Sidebar Scrolling
		*/
		sidebar.on("scroll", function() {
			//console.error("scroll", sidebar.get(0));
			if(sidebar.hasClass('no-more-posts'))
				return;

			var nextPage = sidebar.data("page") + 1;
			ajaxGet('get_sidebar', {
				'page': nextPage,
				'ignore': sidebar.data("ignore")
			}, function(response){
				if(response.length == 0) {
					sidebar.addClass('no-more-posts');
					return;
				}
				//append the items
				$(infiniteScrollConfig.selectors.sidebaritemscont).append(response);
				sidebar.data("page", nextPage);
				sidebar.attr("data-page", nextPage);
				setTimeout(function(){
					sidebar.scroll();
				}, 1);
			});
		}).trigger("scroll");

		/**
		Blog Scrolling
		*/
		var lastScroll = scrollingParent.getViewport();
		scrollingParent.on("scroll", function(){
			//console.error("scroll", scrollingParent.get(0));
			if(!blogarea.is(":visible"))
				return;

			var viewport = scrollingParent.getViewport();
			var allPosts = postscontainer.children();

			var direction = 0;
			if(lastScroll.top < viewport.top){
				direction = 1;
			} else if(lastScroll.top > viewport.top) {
				direction = -1;
			}

			//Cleanup old classes and check for new ones
			allPosts.removeClass('onscreen first last scrolledPastTop scrolledPastBottom');
			var visible = allPosts.filter(function(){
				var bounds = $(this).getBounds();
				var checkPos = [bounds.top, bounds.bottom];
				for(var i = 0; i<checkPos.length; i++) {
					if(checkPos[i] >= viewport.top && checkPos[i] <= viewport.bottom) {
						return true;
					}
				}
				if(bounds.top <= viewport.top && bounds.bottom >= viewport.bottom){
					return true;
				}
				return false;
			})
			visible.addClass('onscreen').first().addClass('first').end().last().addClass('last');

			var firstBounds = visible.first().getBounds();
			if(firstBounds.top >= viewport.top && viewport.top <= firstBounds.bottom){
				visible.first().addClass("scrolledPastTop");
			}

			var lastBounds = visible.last().getBounds();
			if(lastBounds.bottom <= viewport.bottom){
				visible.last().addClass("scrolledPastBottom");
			}

			if(viewport.bottom >= postscontainer.getBounds().bottom) {
				visible.last().markInSidebar();
			} else {
				visible.first().markInSidebar();
			}


			//Post loading triggers
			var firstPost = allPosts.first();
			var lastPost = allPosts.last();
			if(direction < 0) {
				if(firstPost.hasClass('scrolledPastTop') && !firstPost.hasClass('waiting-for-prev')) {
					var postId = getPrev(firstPost.getPostId());
					if(postId !== false){
						firstPost.addClass('waiting-for-prev');
						setTimeout(function(){
							scrollingParent.trigger("loadprev", [postId]);
						}, 10);
					}
				}
			} else {
				if(lastPost.hasClass('scrolledPastBottom') && !lastPost.hasClass('waiting-for-next')) {
					var postId = getNext(lastPost.getPostId());
					if(postId !== false){
						lastPost.addClass('waiting-for-next');
						setTimeout(function(){
							scrollingParent.trigger("loadnext", [postId]);
						}, 10);
					}
				}
			}

			// Set Variables for next calls
			lastScroll = scrollingParent.getViewport();
		}).trigger("scroll"); // trigger the first scroll;

		scrollingParent.onElementResize(function(){
			scrollingParent.trigger("scroll");
		})

		scrollingParent
		.on("loadnext", function(e, id){
			//console.log("load next", id);
			getPost(id, function(response){
				//append the post
				postscontainer.append(response.html);
				scrollingParent.trigger("infinite-loaded", [postscontainer.children("#post-"+id)]);
				postscontainer.children(".waiting-for-next").removeClass('waiting-for-next');
			});
		})
		.on("loadprev", function(e, id){
			//console.log("load prev", id);
			getPost(id, function(response){
				//store previous data for proper rescrolling after inserting
				var prevHeight = scrollingParent.get(0).scrollHeight;
				var prevScrollTop = scrollingParent.scrollTop();

				//actually prepend the post
				postscontainer.prepend(response.html);
				scrollingParent.trigger("infinite-loaded", [postscontainer.children("#post-"+id)]);
				postscontainer.children(".waiting-for-prev").removeClass('waiting-for-prev');

				//keep the last post in the same position is was before prepending
				var diff = scrollingParent.get(0).scrollHeight - prevHeight;
				scrollingParent.scrollTop(prevScrollTop + diff);
			});
		})
		.on("load-single", function(e, id) {
			var loaded = postscontainer.children("#post-"+id);
			if(loaded.length > 0) {
				loaded.markInSidebar();
				scrollingParent.animate({
					"scrollTop": loaded.offset().top
				}, 500).promise().done(function(){
					loaded.markInSidebar();
				});
			} else {
				getPost(id, function(response){
					postscontainer.children().remove();

					//append the post
					postscontainer.append(response.html);
					var postLoaded = postscontainer.children("#post-"+id);
					scrollingParent.trigger("infinite-loaded", [postLoaded]);
					postscontainer.children(".waiting-for-next").removeClass('waiting-for-next');

					//scrolltop
					scrollingParent.scrollTop(postLoaded.offset().top);
				});
			}
		})
		.on("infinite-loaded", function(e, elem){
			if(elem.data("infinite-already-loaded"))
				return;
			elem.data("infinite-already-loaded", true);
			elem.wrap("<div class='post-wrapper'></div>").trigger("infinite-ready");
			elem.unwrap();
			setTimeout(function(){
				scrollingParent.trigger("scroll");
			}, 1);
		}); 

		postscontainer.children().each(function(){
			scrollingParent.trigger("infinite-loaded", [$(this)]);
		});

		/**
		Sidebar load single post
		*/
		sidebar.on("click", "a", function(e) {
			var id = $(this).data("post-id");
			if(id) {
				e.preventDefault();
				scrollingParent.trigger("load-single", [id]);
			}
		});
	});

	$(function(){
		$(document).trigger("contentReady");
	});

	$(window).bind('popstate', function(e){
		var event = e.originalEvent;
		if(event.state === null || typeof event.state["blog_post_id"] == "undefined")
			return;

		var postscontainer = $(infiniteScrollConfig.selectors.postscontainer);
		var scrollingParent = postscontainer.getScrollingParent();

		var post_id = event.state["blog_post_id"];
		scrollingParent.trigger("load-single", [post_id]);
		e.stopImmediatePropagation()
	});
})(jQuery);