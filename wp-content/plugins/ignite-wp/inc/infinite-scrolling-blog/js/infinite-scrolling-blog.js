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
		if(viewportElem.is("html") || viewportElem.is(document))
			viewportElem = $(window);

		var viewport = {};
		viewport.top = viewportElem.scrollTop();
		viewport.bottom = viewport.top + viewportElem.height();
		viewport.left = viewportElem.scrollLeft();
		viewport.right = viewport.left + viewportElem.width();

		$(document).trigger("filter-infinite-viewport", [viewport]);

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
	$.fn.scrollParent2 = function( includeHidden ) {
		var position = this.css( "position" ),
			excludeStaticParent = position === "absolute",
			overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
			scrollParent = this.parents().filter( function() {
				var parent = $( this );
				if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
					return false;
				}
				if(parent.hasClass('no-scrolling-elem'))
					return false;
				return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) );
			} ).eq( 0 );

		return position === "fixed" || !scrollParent.length ? $( this[ 0 ].ownerDocument || document ) : scrollParent;
	}
	$.fn.getScrollingParent = function() {
		var thisEl = $(this);
		var thisElPS = thisEl.parents(".ps-container").first();
		var scrollingParent = $(this).scrollParent2();
		if(thisElPS.parents().filter(scrollingParent).length > 0) {
			scrollingParent = thisElPS;
		}

		if(scrollingParent.is("body"))
			scrollingParent = scrollingParent.closest("html");

		if(scrollingParent.is("html") || scrollingParent.is(document)) {
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

	$.fn.getSidebarItem = function() {
		var id = $(this).getPostId();
		if(id) {
			return $(infiniteScrollConfig.selectors.sidebaritemscont).find("#"+infiniteScrollConfig.prefixmenuitemid+id);
		} else {
			return $();
		}
	}

	$.fn.markInSidebar = function(doPush){
		if(typeof doPush == "undefined")
			doPush = true;

		var postscontainer = $(infiniteScrollConfig.selectors.postscontainer);
		if(!postscontainer.is(":visible"))
			return;

		var scrollingParent = postscontainer.getScrollingParent();
		if(scrollingParent.is(":animated"))
			return;

		var thisElem = $(this);

		if(thisElem.length == 0)
			return;

		var id = thisElem.getPostId();
		if(id) {
			$(this).addClass('current').siblings().removeClass('current');
			var menuItem = $(this).getSidebarItem();
			menuItem.addClass('current').siblings().removeClass('current');

			if(menuItem.length == 0)
				return;

			if(doPush) {
				var title = menuItem.data("wptitle");
				var permalink = menuItem.data("permalink");
				var evt = eventHandler.trigger("infinite-pushing-state", id, postscontainer.find("#post-"+id));
				if(evt.isDefaultPrevented()) {
					return;
				}
				var state = $.extend(true, {}, historyAPI.getState(), {
					blog_post_id: id
				});

				if(typeof historyAPI.getState().blog_post_id != "undefined" && historyAPI.getState().blog_post_id == id) { //if post_id is the same, bail
					return;
				}
				if(!urlsEqual(document.URL, permalink)) {
					historyAPI.pushState(state, title, permalink);
				} else {
					historyAPI.replaceState(state, title);
				}
			}
		}
	}
	var get_postsid = function(){
		return $(infiniteScrollConfig.selectors.sidebaritem);
	}
	var getIdx = function(curr) {
		var postsid = get_postsid();
		var idx = postsid.index($("#"+infiniteScrollConfig.prefixmenuitemid+curr));
		return idx;
	}
	var getNext = function(curr){
		var postsid = get_postsid();
		var nextIndex = getIdx(curr) + 1;
		if(typeof postsid[nextIndex] != "undefined"){
			return $(postsid[nextIndex]).getPostId();
		} else {
			return false;
		}
	}
	var getPrev = function(curr){
		var postsid = get_postsid();
		var nextIndex = getIdx(curr) - 1;
		if(typeof postsid[nextIndex] != "undefined"){
			return $(postsid[nextIndex]).getPostId();
		} else {
			return false;
		}
	}

	var getPost = function(id, cb, req){
		if(typeof req == "undefined")
			req = "scroll";

		ajaxGetJSON('get_post_by_id', {
			'post_id': id,
			'req': req
		}, function(){
			var json = arguments[1];
			if(typeof json === "object") {
				var menuItem = $(infiniteScrollConfig.selectors.sidebaritemscont).find("#"+infiniteScrollConfig.prefixmenuitemid+id);
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
	Event handling
	*/

	var eventHandler;

	/**
	Initialization
	*/
	var ajaxAPIIntegrated = false;
	$(document).on("contentFirstLoad ready", function(e){
		/*if(e.target !== document) {
			console.log(e.target);
		}*/

		infiniteScrollConfig.posts_before_button = parseInt(infiniteScrollConfig.posts_before_button, 10);

		var blogarea = $(infiniteScrollConfig.selectors.blogarea);
		if(blogarea.data("blog-initialized") || blogarea.length == 0) 
			return;

		eventHandler = new SAUCAL_AJAX_EVENTS($(document));

		blogarea.data("blog-initialized", true)
		var postscontainer = $(infiniteScrollConfig.selectors.postscontainer);
		var sidebar = $(infiniteScrollConfig.selectors.sidebar);
		var sidebarScrollingPart = $(infiniteScrollConfig.selectors.sidebaritem).getScrollingParent();

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



		var getSidebarConfig = function() {
			var ret = {};
			if(sidebar.data("single"))
				ret.single = parseInt(sidebar.data("single"), 10);
			if(sidebar.data("filter"))
				ret.filter = sidebar.data("filter");
			if(sidebar.data("order"))
				ret.order = sidebar.data("order");
			if(sidebar.data("category"))
				ret.category = parseInt(sidebar.data("category"), 10);
			if(sidebar.data("month"))
				ret.month = sidebar.data("month");
			return ret;
		}

		/**
		Sidebar Scrolling
		*/

		var triggerLoading = function(){
			setTimeout(function(){
				sidebarScrollingPart.scroll();
			}, 1);
		}

		sidebarScrollingPart.on("scroll", function(e) {
			e.stopPropagation();
			//console.error("scroll", sidebar.get(0));
			if(sidebar.hasClass('no-more-posts'))
				return;

			if(parseInt(sidebar.data("found-posts"), 10) == $(infiniteScrollConfig.selectors.sidebaritem).length) {
				sidebar.addClass('no-more-posts');
			}

			var key = Math.random();
			sidebar.data("ajax-key", key);


			var nextPage = sidebar.data("page") + 1;
			ajaxGet('get_sidebar', {
				'page': nextPage,
				'single': sidebar.data("single"),
				'filter': sidebar.data("filter") || "",
				'order': sidebar.data("order") || "",
				'category': sidebar.data("category") || 0,
				'month': sidebar.data("month") || ""
			}, function(response, json){
				if(sidebar.data("ajax-key") != key)
					return;

				if(typeof json != "object" || json.html.length == 0) {
					sidebar.addClass('no-more-posts');
					return;
				}

				//append the items
				$(infiniteScrollConfig.selectors.sidebaritemscont).append(json.html);

				sidebar.data("page", nextPage);
				sidebar.attr("data-page", nextPage);

				sidebar.data("found-posts", json.found_posts);
				sidebar.attr("data-found-posts", json.found_posts);

				if(sidebar.data("found-posts") == $(infiniteScrollConfig.selectors.sidebaritem).length) {
					sidebar.addClass('no-more-posts');
				}

				if(nextPage == 1 && sidebar.data("single") === 0) {
					var ignId = $(infiniteScrollConfig.selectors.sidebaritem).first().getPostId();
					sidebar.data("single", ignId);
					sidebar.attr("data-single", ignId);
					//postscontainer.children().remove();
					scrollingParent.off("infinite-loaded", triggerLoading).one("infinite-loaded", triggerLoading);
					scrollingParent.off("infinite-scrolling-to.sidebar-search").one("infinite-scrolling-to.sidebar-search", function(e, post){
						post.siblings().remove();
					});
					scrollingParent.trigger("load-single", [ignId, true]);
					scrollingParent.trigger("maybeLoad");
				} else {
					triggerLoading();
				}
			});
		}).trigger("scroll");

		sidebar.on("keyup", ".search-field", function(e, avoid){
			if(avoid)
				return;

			var prev = $(this).data("prev-val") || "";

			if(e.which == 13 || e.which == 27) {

				if(e.which == 27) {
					$(this).val("")
				} else if (e.which == 13) {
				}

				var currVal = $(this).val();

				if(prev == currVal)
					return;

				$(this).data("prev-val", currVal);

				sidebar.data("single", 0);
				sidebar.data("filter", currVal);
				sidebar.data("ajax-key", "");
				sidebar.removeClass('no-more-posts');
				sidebar.data("page", 0);
				$(infiniteScrollConfig.selectors.sidebaritem).remove();
				sidebarScrollingPart.trigger("scroll");
			}
		})

		sidebar.on("change", ".order-field, .archive-field, .category-field", function(e, ignore, avoid){
			if(avoid)
				return;

			var currVal = $(this).val();
			sidebar.data("single", 0);
			if($(this).hasClass('order-field')) {
				sidebar.data("order", currVal);
			} else if($(this).hasClass('archive-field')) {
				sidebar.data("month", currVal);
			} else if($(this).hasClass('category-field')) {
				sidebar.data("category", currVal);
			}
			sidebar.data("ajax-key", "");
			sidebar.removeClass('no-more-posts');
			sidebar.data("page", 0);
			$(infiniteScrollConfig.selectors.sidebaritem).remove();
			sidebarScrollingPart.trigger("scroll");
		});

		sidebar.on("changeSidebar", function(e, data){
			if(typeof data == "undefined")
				data = {};

			if(typeof data.single != "undefined") {
				sidebar.data("single", data.single);
				sidebar.attr("data-single", data.single);
			} else {
				sidebar.data("single", 0);
				sidebar.removeAttr("data-single");
			}

			if(typeof data.category != "undefined") {
				sidebar.find(".category-field").val(data.category);
				sidebar.data("category", data.category);
				sidebar.attr("data-category", data.category);
			} else {
				sidebar.find(".category-field").val(0);
				sidebar.data("category", false);
				sidebar.removeAttr("data-category");
			}

			if(typeof data.month != "undefined") {
				sidebar.find(".archive-field").val(data.month);
				sidebar.data("month", data.month);
				sidebar.attr("data-month", data.month);
			} else {
				sidebar.find(".archive-field").val("");
				sidebar.data("month", false);
				sidebar.removeAttr("data-month");
			}

			if(typeof data.order != "undefined") {
				sidebar.find(".order-field").val(data.order);
				sidebar.data("order", data.order);
				sidebar.attr("data-order", data.order);
			} else {
				sidebar.find(".order-field").val("date_desc");
				sidebar.data("order", false);
				sidebar.removeAttr("data-order");
			}

			if(typeof data.filter != "undefined") {
				sidebar.find(".search-field").val(data.filter);
				sidebar.data("filter", data.filter);
				sidebar.attr("data-filter", data.filter);
			} else {
				sidebar.find(".search-field").val("");
				sidebar.data("filter", false);
				sidebar.removeAttr("data-filter");
			}

			sidebar.find(".category-field, .archive-field, .order-field").trigger("change", [undefined, true]);
			sidebar.find(".search-field").trigger("keyup", [true]);

			sidebar.data("ajax-key", "");
			sidebar.removeClass('no-more-posts');
			sidebar.data("page", 0);
			$(infiniteScrollConfig.selectors.sidebaritem).remove();
			sidebarScrollingPart.trigger("scroll");
		});

		/**
		Blog Scrolling
		*/
		var lastScroll = scrollingParent.getViewport();
		var scrollingAfterPopstate = false;
		historyAPI.on("popstate", function() {
			scrollingAfterPopstate = true;
		})
		scrollingParent.on("scroll", function(e){
			scrollingParent.trigger("maybeLoad");
		})

		postscontainer.on("click", ".infinite-next-batch, .infinite-prev-batch", function(e){
			e.preventDefault();
			var direction = 1;
			if($(this).is('.infinite-prev-batch'))
				direction = -1;
			scrollingParent.trigger("maybeLoad", [true, direction]);
		});

		scrollingParent.on("maybeLoad", function(e, forceLoad, forceDirection){
			if(!$(e.target).is(scrollingParent))
				return;

			//console.error("scroll", scrollingParent.get(0));
			if(!blogarea.is(":visible"))
				return;

			if(typeof ajaxAPI != "undefined") {
				if(blogarea.closest(ajaxAPI.config.contentSelector).hasClass('ajax-leaving'))
					return;
			}

			var viewport = scrollingParent.getViewport();
			var dividerLines = postscontainer.children(".divider-line");
			var allPosts = postscontainer.children().not(dividerLines);

			var direction = 0;
			if(typeof forceDirection != "undefined") {
				direction = forceDirection;
			} else {
				if(lastScroll.top < viewport.top){
					direction = 1;
				} else if(lastScroll.top > viewport.top) {
					direction = -1;
				}
			}
			// Set Variables for next calls
			lastScroll = scrollingParent.getViewport();

			//Cleanup old classes and check for new ones
			allPosts.removeClass('onscreen first last scrolledPastTop scrolledPastBottom');
			var visible = allPosts.filter(function(){
				var bounds = $(this).getBounds();
				var checkPos = [bounds.top, bounds.bottom];
				for(var i = 0; i<checkPos.length; i++) {
					if(checkPos[i] > viewport.top && checkPos[i] <= viewport.bottom) {
						return true;
					}
				}
				if(bounds.top <= viewport.top && bounds.bottom >= viewport.bottom){
					return true;
				}
				return false;
			})
			visible.addClass('onscreen').first().addClass('first').end().last().addClass('last');

			if(visible.length > 0) {
				var firstBounds = visible.first().getBounds();
				if(firstBounds.top >= viewport.top && viewport.top <= firstBounds.bottom){
					visible.first().addClass("scrolledPastTop");
				}

				var lastBounds = visible.last().getBounds();
				if(lastBounds.bottom <= viewport.bottom){
					visible.last().addClass("scrolledPastBottom");
				}

				if(viewport.bottom >= postscontainer.getBounds().bottom) {
					visible.last().markInSidebar(!scrollingAfterPopstate);
				} else {
					visible.first().markInSidebar(!scrollingAfterPopstate);
				}
			} else {
				if(viewport.top < postscontainer.getBounds().top) {
					allPosts.first().addClass('scrolledPastTop').markInSidebar(!scrollingAfterPopstate);
				} else if(viewport.bottom > postscontainer.getBounds().bottom) {
					allPosts.last().addClass("scrolledPastBottom").markInSidebar(!scrollingAfterPopstate);
				}
			}

			

			//Post loading triggers
			var firstPost = allPosts.first();
			var lastPost = allPosts.last();
			if(direction < 0) {
				var postsAfterButton = allPosts.length;
				if(dividerLines.length > 0) {
					postsAfterButton = dividerLines.first().prevAll().length;
				}

				if(postsAfterButton >= infiniteScrollConfig.posts_before_button) {
					var firstID = allPosts.first().getPostId();
					if(!getPrev(firstID))
						return;

					var firstIdx = getIdx(firstID);
					var postsleft = firstIdx;
					var nextPageItems = infiniteScrollConfig.posts_before_button;
					if(nextPageItems > postsleft)
						nextPageItems = postsleft;
					
					var html = infiniteScrollConfig.load_prev_posts_button;
					html = html.replace("%ITEMSLEFT%", postsleft).replace("%NEXTPAGEITEMS%", nextPageItems);

					$("<div/>", {
						"class": "divider-line divider-prev"
					}).html($(html).addClass('infinite-prev-batch')).prependTo(postscontainer);
					return;
				}

				if(postsAfterButton == 0 && !forceLoad) 
					return;


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
				var postsAfterButton = allPosts.length;
				if(dividerLines.length > 0) {
					postsAfterButton = dividerLines.last().nextAll().length;
				}

				if(postsAfterButton >= infiniteScrollConfig.posts_before_button) {

					var lastID = allPosts.last().getPostId();
					if(!getNext(lastID))
						return;

					var lastIdx = getIdx(lastID);
					var postsleft = parseInt(sidebar.data("found-posts"), 10) - (lastIdx + 1);
					var nextPageItems = infiniteScrollConfig.posts_before_button;
					if(nextPageItems > postsleft)
						nextPageItems = postsleft;
					
					var html = infiniteScrollConfig.load_next_posts_button;
					html = html.replace("%ITEMSLEFT%", postsleft).replace("%NEXTPAGEITEMS%", nextPageItems);

					$("<div/>", {
						"class": "divider-line divider-next"
					}).append($(html).addClass('infinite-next-batch')).appendTo(postscontainer);
					return;
				}

				if(postsAfterButton == 0 && !forceLoad) 
					return;


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

			scrollingAfterPopstate = false;
		}).trigger("maybeLoad"); // trigger the first scroll;

		scrollingParent.onElementResize(function(){
			scrollingParent.trigger("maybeLoad");
		})

		scrollingParent
		.on("loadnext", function(e, id){
			//console.log("load next", id);
			getPost(id, function(response){
				//append the post
				postscontainer.append(response.html);
				postscontainer.children(".divider-line").last().hide();
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
				postscontainer.children(".divider-line").first().hide();
				scrollingParent.trigger("infinite-loaded", [postscontainer.children("#post-"+id)]);
				postscontainer.children(".waiting-for-prev").removeClass('waiting-for-prev');

				//keep the last post in the same position is was before prepending
				var diff = scrollingParent.get(0).scrollHeight - prevHeight;
				scrollingParent.scrollTop(prevScrollTop + diff);
			});
		})
		.on("load-single", function(e, id, ignoreFilter) {
			var loaded = postscontainer.children("#post-"+id);
			if(loaded.length > 0) {
				loaded.markInSidebar(!ignoreFilter);
				scrollingParent.trigger("infinite-scrolling-to", [loaded]);
				var scrollingTo = {
					top: loaded.offset().top
				};
				scrollingParent.trigger("filter-scrolling-to", [scrollingTo]);
				if(!ignoreFilter)
					scrollingParent.trigger("loading-single", [loaded]);

				scrollingParent.stop().animate({
					"scrollTop": scrollingTo.top
				}, 500).promise().done(function(){
					loaded.markInSidebar(false);
				});
			} else {
				getPost(id, function(response){
					postscontainer.children().remove();

					//append the post
					postscontainer.append(response.html);
					var postLoaded = postscontainer.children("#post-"+id);
					scrollingParent.trigger("infinite-loaded", [postLoaded]);
					if(!ignoreFilter)
						scrollingParent.trigger("loading-single", [postLoaded]);

					postscontainer.children(".waiting-for-next").removeClass('waiting-for-next');

					//scrolltop
					scrollingParent.scrollTop(postLoaded.offset().top);
				}, "single");
			}
		})
		.on("infinite-loaded", function(e, elem){
			if(elem.data("infinite-already-loaded"))
				return;
			elem.data("infinite-already-loaded", true);
			elem.wrap("<div class='post-wrapper'></div>").trigger("infinite-ready");
			elem.unwrap();
			setTimeout(function(){
				scrollingParent.trigger("maybeLoad");
			}, 1);
		}); 

		postscontainer.children().not(".divider-line").each(function(){
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

		var goToPost = function(post_id){
			var postscontainer = $(infiniteScrollConfig.selectors.postscontainer);
			var scrollingParent = postscontainer.getScrollingParent();
			scrollingParent.trigger("load-single", [post_id]);
		}

		if(typeof ajaxAPI != "undefined" && !ajaxAPIIntegrated) {
			ajaxAPIIntegrated = true;

			var baseURL = postscontainer.closest(ajaxAPI.config.contentSelector).data("ajax-alias");
			var baseBuffer;
			ajaxAPI.getPage(baseURL).done(function(buff){
				baseBuffer = buff;
			});

			ajaxAPI.on("saucal_popstate", function(e, state) {
				if(state === null || (typeof state["blog_post_id"] == "undefined" && typeof state["blog_state"] == "undefined"))
					return;

				e.stopPropagation();
				var changeFn = function() {
					if(typeof state["blog_state"] != "undefined") {
						if(typeof state["blog_state"].single != "undefined") {
							goToPost(state["blog_state"].single);
						} else {
							sidebar.trigger("changeSidebar", [state["blog_state"]]);
						}
					} else {
						goToPost(state["blog_post_id"]);
					}
				}

				var currentContent = $(ajaxAPI.config.contentSelector);
				if(baseBuffer.is(currentContent)) {
					changeFn();
				} else {
					ajaxAPI.switchTo(baseBuffer);
					ajaxAPI.one("contentLoad", function(e){
						changeFn();
					});
				}
			});

			$(document).on("infinite-pushing-state", function(e, id, post) {
				baseBuffer.ajaxAPIData("aliasing-as", post.getSidebarItem().data("permalink"));
			});

			baseBuffer.ajaxAPIData("blogHelper", getSidebarConfig());

			ajaxAPI.on("beforeBuffer", function(e, content, ajaxBody, bufferData){
				var blogHelper = ajaxBody.find("div.blog-helper");
				if(blogHelper.length > 0) {
					bufferData.blogHelper = $.parseJSON(blogHelper.html());
				}
			});

			ajaxAPI.on("prevHideOldContent", function(e, newContent, currContent, effDef, def) {
				if(newContent.ajaxAPIData("alias") == baseURL) {
					var blogHelper = newContent.ajaxAPIData("blogHelper");
					if(blogHelper) {
						e.preventDefault();

						var switchContentFn = function(){
							var maskAs = newContent.ajaxAPIData("url");
							if(maskAs == baseURL)
								return;

							if(baseBuffer.ajaxAPIData("aliasing-as") == baseURL) {
								blogHelper = {};
								maskAs = baseURL;
							} 
							baseBuffer.ajaxAPIData("aliasing-as", maskAs);


							var state = $.extend(true, {}, {
								blog_state: blogHelper
							});
							var title = newContent.ajaxAPIData("title");

							historyAPI.pushState(state, title, maskAs);

							if(typeof blogHelper.single != "undefined") {
								goToPost(parseInt(blogHelper.single, 10));
							} else {
								sidebar.trigger("changeSidebar", [blogHelper]);
							}
						}
						if(currContent.is(baseBuffer)) {
							switchContentFn();
						} else {
							ajaxAPI.switchTo(baseBuffer);
							ajaxAPI.one("contentLoad", function(e){
								switchContentFn();
							})
						}
					}
				}
			});

		} else {
			historyAPI.on("popstate", function(e, state){
				if(state === null || (typeof state["blog_post_id"] == "undefined" && typeof state["blog_state"] == "undefined"))
					return;

				if(typeof state["blog_state"] != "undefined" && typeof state["blog_state"].single != "undefined") {
					goToPost(state["blog_state"].single);
				} else {
					goToPost(state["blog_post_id"]);
				}
			})
		}
	});
})(jQuery);