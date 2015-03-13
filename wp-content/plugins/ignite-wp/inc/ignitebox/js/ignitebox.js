(function($){
	var getThese = {};
	var getTheseIds = [];
	var finalInfo = {};
	var fetchData = _.debounce(_fetchData, 100); 

	$.ignitebox = {
		elementsAttached: ["caption", "prev", "next"],
		buttonContent: {
			"caption": "",
			"prev": "prev",
			"next": "next",
			"close": "X",
			"comments": "talk"
		}
	};

	$(document).on("infinite-loaded contentReady ready", function(e, post){
		if(!post)
			post = $(document);

		post.find('a[href$=".png"], a[href$=".jpg"], a[href$=".gif"], a[rel^="attachment "], .gallery a').each(function(){
			var thisLink = $(this);
			if(typeof thisLink.data("ingitebox-init-def") != "undefined") //if we initialized this already, skip
				return;

			var def = $.Deferred();
			thisLink.data("ingitebox-init-def", def);

			var thisImgPreview = thisLink.find("img");

			var id = thisImgPreview.attr("data-wp-image");
			if(!id)
				id = thisImgPreview.attr("class");
			else
				id = "wp-image-"+id;

			if(!id)
				id = "";

			id = id.match(/wp-image-([0-9]+)(?:\s|$)/);
			if(typeof id[1] != "undefined")
				id = id[1]
			else 
				id = 0;

			if(id) {
				if(typeof getThese[id] == "undefined")
					getThese[id] = [];

				getThese[id].push({
					"link": thisLink,
					"img": thisImgPreview
				});

				getTheseIds.push(id);

				fetchData();
			} else {
				def.rejectWith(thisLink, [{}]);
			}

			var gallery = thisLink.parents(".gallery").first();

			if(gallery.length == 0)
				gallery = thisLink.parents(".post-content").first();
			
			thisLink.data("ignitebox-gallery", gallery);
			gallery.data("ignitebox-pictures", []);
			if(typeof dataGallery == "undefined") {
				dataGallery = [];
			}

			thisLink.on("click", voidClick);

			var diffCaption;

			var captionElem;
			captionElem = thisLink.siblings(".wp-caption-text");

			if(captionElem.length)
				diffCaption = captionElem.html().trim();
			else {
				captionElem = thisLink.parents(".gallery-item").children(".wp-caption-text");
				if(captionElem.length)
					diffCaption = captionElem.html().trim();
			}

			def
			.done(function(data){
				this.data("ignitebox-gallery-index", gallery.data("ignitebox-pictures").length)

				if(diffCaption)
					data.caption = diffCaption;
				
				addToGallery(this, data)
			})
			.fail(function(data){
				//console.log("fail", this, data);
			})
			.always(function(){
				thisLink.off("click", voidClick);
			})
		});
	});

	function voidClick(e) {
		e.preventDefault();
	}

	function _fetchData() {
		var ids = Object.keys(getThese);
		ajaxPost("get_ignitebox_info", {
			ids: JSON.stringify(ids)
		}, function(data, json){
			if(typeof json == "object"){
				$.each(getTheseIds, function(i, id){
					var elems = getThese[id];
					var action = "resolve";
					var attData = {};
					if(typeof json[id] != "undefined"){
						attData = json[id];
					} else {
						action = "reject";
					}

					$.each(elems, function(i, data){
						var def = data.link.data("ingitebox-init-def");
						def[action+"With"](data.link, [$.extend(true, {}, attData)]);
					});
				});
			}
		});
	}

	function addToGallery(link, data) {
		var gallery = link.data("ignitebox-gallery");
		gallery.data("ignitebox-pictures").push(data);
		link.on("click", openGallery(gallery));

		if(disqus_configs) {
			disqus_configs["post_"+data.id] = {
				page: {
					url: data.link,
					identifier: data.id+" "+data.guid,
					title: data.title
				},
				wp_post_id: ''+data.id
			}
		}
	}

	function openGallery(gallery) {
		return function(e){
			var thisLink = $(this);
			var goTo = thisLink.data("ignitebox-gallery-index");
			e.preventDefault();

			var gallDisplay = drawGallery(gallery.data("ignitebox-pictures"), goTo);
			gallDisplay.one('transitionend webkitTransitionEnd', function(e){
				gallDisplay.css("opacity", "")
			})
			gallDisplay.css("opacity", 1);
			$("body").addClass('ignitebox-open')
		}
	}

	function addButtonsAndAreas(elements, appendTo) {
		$.each(elements, function(i, item){
			var elem;
			if(item == "caption"){
				elem = newDiv("ignitebox-area-"+item).append(newDiv("ignitebox-area-caption-text")).appendTo(appendTo);
			}
			if(!elem){
				var elem = newElem("a", "ignitebox-action-"+item, {
					"href": "#"
				}).html($.ignitebox.buttonContent[item]).appendTo(appendTo);
				if(item == "comments"){
					var commArea = newDiv("ignitebox-comment-area").insertAfter(elem);
					elem.appendTo(commArea);
					var commentWrap = newDiv("ignitebox-comment-area-inner-wrap").appendTo(commArea);
					//calc scroll width
					commentWrap.css({
						"width": "10000px",
						"overflow-y": "scroll"
					});
					var scrollWidth = 10000 - commentWrap.get(0).clientWidth;
					commentWrap.removeAttr('style');
					//end calc scroll width
					var closeCont = newDiv("ignitebox-comment-close-cont").css("right", scrollWidth).appendTo(commentWrap);
					var closeButton = newElem("a", "ignitebox-action-close-comments", {
						"href": "#"
					}).html($.ignitebox.buttonContent["close"]).appendTo(closeCont);
					var commSubCont = newDiv("ignitebox-comment-container").appendTo(commentWrap);
				}
			}
		});
	}

	function drawGallery(pics, goTo) {
		if(typeof goTo == "undefined" || typeof goTo != "number")
			goTo = 0;


		var elementsToAttach = ["caption", "close", "prev", "next", "comments"];
		var elementsAttached = $.ignitebox.elementsAttached;
		var elementsFixed = array_values(array_diff(elementsToAttach, $.ignitebox.elementsAttached));

		var gallery = $("#ignitebox");
		if(gallery.length == 0){
			gallery = newDiv({
				"id": "ignitebox"
			}).css("opacity", 0).appendTo("body");

			gallery.data("ignitebox-current-gallery-pics", pics);

			addButtonsAndAreas(elementsFixed, gallery);

			if(elementsFixed.indexOf("caption") !== -1){
				gallery.on("maybe-update-caption", updateCaptionTrigger);
			}

			//events
			gallery.on("click", ".ignitebox-action-next", moveNext);
			gallery.on("click", ".ignitebox-action-prev", movePrev);
			gallery.on("click", ".ignitebox-action-close", closeGall);
			gallery.on("click", ".ignitebox-action-comments", openComments);
			gallery.on("click", ".ignitebox-action-close-comments", closeComments);

			gallery.on("touchstart", swipeMaybe);
			gallery.on("touchmove", swipeDoing);
			gallery.on("touchend", swipeEnd);
		}

		var imagesContCont = gallery.find("#ignitebox-images-cont")
		var imagesCont = imagesContCont.find("#ignitebox-images");
		if(imagesCont.length == 0) {
			imagesContCont = newDiv({
				"id": "ignitebox-images-cont"
			}).appendTo(gallery);
			imagesCont = newDiv({
				"id": "ignitebox-images"
			}).appendTo(imagesContCont);
		}

		var prevImgs = imagesCont.find(".ignitebox-image");

		if(prevImgs.length > 0){
			prevImgs.fadeOut(200).promise().done(function(){
				prevImgs.remove();
			});
		}

		$.each(pics, function(i, pic){
			var slideCont = newDiv("ignitebox-image").appendTo(imagesCont);
			var slide = newDiv("ignitebox-image-container").appendTo(slideCont);
			var slideControls = newDiv("ignitebox-image-bars").appendTo(slide);

			slideCont.data("ignitebox-pic", pic);

			var img = newElem("img", {
				"data-src": pic.url,
				"src": "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
			})
			.attr("width", pic.width)
			.attr("height", pic.height)
			.appendTo(slide);


			addButtonsAndAreas(elementsAttached, slideControls);

			if(elementsAttached.indexOf("caption") !== -1){
				var captionElem = slideControls.find(".ignitebox-area-caption");
				if(pic.caption.length > 0){
					captionElem.children(".ignitebox-area-caption-text").html(pic.caption);
				} else {
					captionElem.remove();
				}
			}
		});

		imagesCont.css({
			transform: "translate3d(-"+(goTo * 100)+"%,0,0)"
		});

		var theseImages = imagesCont.find(".ignitebox-image");
		var initial = theseImages.eq(goTo);
		initial.addClass('current');
		loadImg(theseImages, goTo, true).done(function(){
			if(elementsFixed.indexOf("caption") !== -1)
				updateCaption(gallery, goTo, goTo, true);
		});


		// resizing checks
		var checkSize = _.debounce(function(){
			var sizeInt = 0;
			if(window.matchMedia) {
				if(matchMedia('(min-width: 480px)').matches || matchMedia('(min-resolution: 260dpi)').matches) {
					sizeInt++;
				}
				if(matchMedia('(min-width: 1200px)').matches || matchMedia('(min-resolution: 350dpi)').matches) {
					sizeInt++;
				}
			}

			theseImages.each(function(){
				var thisCont = $(this);
				var pic = $(this).data("ignitebox-pic");
				var thisImgCont = thisCont.find(".ignitebox-image-container");
				var thisMaxHeight = thisCont.height() - (thisImgCont.outerHeight(true) - thisImgCont.height());
				var thisMaxWidth = thisCont.width() - (thisImgCont.outerWidth(true) - thisImgCont.width());
				var thisImg = thisImgCont.children("img");
				thisImg.css({
					maxWidth: thisMaxWidth,
					maxHeight: thisMaxHeight
				})

				if(window.matchMedia && typeof thisImg.attr("data-src") == "undefined") {
					var urlToLoad = pic.url;
					switch(sizeInt) {
						case 0:
							if(typeof pic.sizes["medium"] != "undefined"){
								urlToLoad = pic.sizes["medium"].url;
								break;
							}
						case 1:
							if(typeof pic.sizes["large"] != "undefined"){
								urlToLoad = pic.sizes["large"].url;
								break;
							}
					}
					if(urlToLoad != thisImg.get(0).src){
						thisImg.attr("src", urlToLoad);
					}
				}
			})
			gallery.find(".ignitebox-comment-area-inner-wrap, .ignitebox-comment-area-inner-wrap, .ignitebox-comment-area").css("max-width", gallery.width());
		}, 10)

		$(window).on("resize.ignitebox", checkSize);
		checkSize();

		return gallery;
	}


	function loadImg(theseImages, index, surroundings) {
		var def = $.Deferred();
		var thisImgWrap = theseImages.eq(index);
		var pic = thisImgWrap.data("ignitebox-pic");
		var thisImg = theseImages.eq(index).find(".ignitebox-image-container > img");
		var ignitebox = thisImg.parents("#ignitebox").first();
		if(typeof thisImg.attr("data-src") != "undefined") {
			var urlToLoad = thisImg.attr("data-src");
			if(window.matchMedia) {
				var sizeInt = 0;
				if(matchMedia('(min-width: 480px)').matches || matchMedia('(min-resolution: 260dpi)').matches) {
					sizeInt++;
				}
				if(matchMedia('(min-width: 1200px)').matches || matchMedia('(min-resolution: 350dpi)').matches) {
					sizeInt++;
				}
				switch(sizeInt) {
					case 0:
						if(typeof pic.sizes["medium"] != "undefined")
							urlToLoad = pic.sizes["medium"].url;
						break;
					case 1:
						if(typeof pic.sizes["large"] != "undefined")
							urlToLoad = pic.sizes["large"].url;
						break;
				}
			}

			thisImg.data("img-load-def", def);
			var thisImgCont = thisImg.parents(".ignitebox-image-container").addClass('loading');
			thisImg.one("load", function(){
				thisImgCont.fadeIn(200);
				thisImgCont.removeClass('loading');
				def.resolve()
			});
			thisImgCont.hide();
			thisImg.attr("src", urlToLoad).removeAttr('data-src');
		} else {
			def = thisImg.data("img-load-def");
		}
		if(surroundings){
			ignitebox.addClass("loading");
			def.done(function(){
				ignitebox.removeClass("loading");
				loadSurroundings(theseImages, index);
			})
		}
		return def.promise();
	}

	function moveNext(e){
		moveSlideTrigger(e, 1);
	}
	function movePrev(e){
		moveSlideTrigger(e, -1);
	}
	function moveSlideTrigger(e, direction){
		e.preventDefault();
		var gallery = $(e.delegateTarget);
		moveSlide(gallery, direction);
	}
	function moveSlide(gallery, direction) {
		var imagesCont = gallery.find("#ignitebox-images");
		var theseImages = gallery.find(".ignitebox-image");
		var current = theseImages.filter(".current");
		var currIndex = theseImages.index(current);
		var nextIndex = (currIndex + direction);
		if(typeof theseImages[nextIndex] == "undefined") {
			return;
		}

		loadImg(theseImages, nextIndex, true);

		imagesCont.css({
			transform: "translate3d(-"+(nextIndex * 100)+"%,0,0)"
		})

		theseImages.removeClass('current').eq(nextIndex).addClass('current')

		gallery.trigger("maybe-update-caption", [gallery, nextIndex, currIndex]);
	}

	function updateCaptionTrigger(e, gallery, index, prevIndex) {
		updateCaption(gallery, index, prevIndex);
	}
	function updateCaption(gallery, index, prevIndex, instantHide) {
		if(prevIndex === index && !instantHide)
			return;

		var captionArea = gallery.children(".ignitebox-area-caption");
		var captionText = captionArea.children(".ignitebox-area-caption-text");
		var duration = 200;
		if(instantHide)
			duration = 0;


		var newPic = gallery.data("ignitebox-current-gallery-pics")[index];
		var fadeObj = captionArea;
		if(captionArea.is(":visible")){
			if(newPic.caption.length > 0) {
				fadeObj = captionText;
			}
		} else {
			captionText.show();
		}

		fadeObj.fadeOut(duration).promise().done(function(){
			captionText.html("");
			if(newPic.caption.length > 0){
				captionText.html(newPic.caption)
				fadeObj.fadeIn(200);
			}
		})
	}

	function closeGall(e) {
		e.preventDefault();
		var gallery = $(e.delegateTarget);
		gallery.one('transitionend webkitTransitionEnd', function(e){
			gallery.remove();
			$("body").removeClass('ignitebox-open');
		})
		gallery.css("opacity", 0);
	}

	function openComments(e){
		e.preventDefault();
		var gallery = $(e.delegateTarget);
		var finished = false;

		if(gallery.hasClass('comments-open')){
			return;
		}

		var currentImg = gallery.find(".ignitebox-image.current").data("ignitebox-pic");

		gallery
		.off('transitionend.closeComments webkitTransitionEnd.closeComments')
		.off('transitionend.openComments webkitTransitionEnd.openComments')
		.one('transitionend.openComments webkitTransitionEnd.openComments', ".ignitebox-comment-area", function(e){
			finished = true;
		  	$(window).trigger("resize.ignitebox");
		  	gallery.removeClass('comments-opening');
		  	loadComments("post_"+currentImg.id).done(function(){
		  		gallery.find(".ignitebox-comment-area-inner-wrap").scrollTop(0);
		  	});
		})

		function step(timestamp) {
		  if(!finished){
		  	$(window).trigger("resize.ignitebox");
			window.requestAnimationFrame(step);
		  }
		}

		gallery.find(".ignitebox-comment-container").html('<div id="disqus_thread_post_'+currentImg.id+'" class="disqus_thread" data-thread-id="post_'+currentImg.id+'"></div>');

		window.requestAnimationFrame(step);
		gallery.addClass('comments-opening').removeClass('comments-closing').addClass('comments-open');
		gallery.on("click", clickOutsideCommentsHandle);
	}

	function closeComments(e){
		e.preventDefault();
		var gallery = $(e.delegateTarget);
		var finished = false;
		gallery
		.off('transitionend.openComments webkitTransitionEnd.openComments')
		.off('transitionend.closeComments webkitTransitionEnd.closeComments')
		.one('transitionend.closeComments webkitTransitionEnd.closeComments', ".ignitebox-comment-area", function(e){
			finished = true;
		  	$(window).trigger("resize.ignitebox");
		  	gallery.removeClass('comments-closing');
		  	gallery.find(".ignitebox-comment-container").html("");
		})

		function step(timestamp) {
		  if(!finished){
		  	$(window).trigger("resize.ignitebox");
			window.requestAnimationFrame(step);
		  }
		}

		window.requestAnimationFrame(step);
		gallery.addClass('comments-closing').removeClass('comments-opening').removeClass('comments-open');
		gallery.off("click", clickOutsideCommentsHandle);
	}

	function clickOutsideCommentsHandle(e) {
		if($(e.target).parents().andSelf().filter(".ignitebox-comment-area").length == 0) {
			closeComments(e);
		}
	}

	function loadSurroundings(theseImages, currIndex) {
		var next = currIndex + 1;
		var prev = currIndex - 1;
		var load = [];
		if(prev >= 0)
			load.push(prev);
		if(next < theseImages.length)
			load.push(next);

		for(var i=0;i<load.length;i++){
			loadImg(theseImages, load[i]);
		}
	}

	function swipeMaybe(ev) {
		var e = ev.originalEvent;
		var gallery = $(ev.delegateTarget);
		if(e.touches.length > 0) {
			var allImages = gallery.find(".ignitebox-image")
			var current = allImages.filter(".current");
			var currentIndex = allImages.index(current);
			var data = {
				start: {
					x: e.touches[0].clientX,
					y: e.touches[0].clientY
				},
				move: {
					x: 0,
					y: 0
				},
				currentIndex: currentIndex,
				lastIndex: allImages.length - 1,
				startTime: new Date()
			};
			data.current = $.extend(true, {}, data.start);
			data.movePerc = $.extend(true, {}, data.move);
			gallery.data("ignitebox-swipe", data);
		}
	}
	function _updatePosition(){
		var gallery = $("#ignitebox");
		var data = gallery.data("ignitebox-swipe");
		if(typeof data != "undefined") {
			gallery.find("#ignitebox-images").css({
				transform: "translate3d("+(data.pos * -1)+"%,0,0)"
			});
		}
	}
	var updatePosition = _.throttle(_updatePosition, Math.floor(1000 / 60)); //lock this at 60fps
	function swipeDoing(ev){
		var e = ev.originalEvent;
		var gallery = $(ev.delegateTarget);
		var data = gallery.data("ignitebox-swipe");
		if(e.touches.length > 0 && typeof data != "undefined") {
			gallery.addClass('swiping');
			data.current = {
				x: e.touches[0].clientX,
				y: e.touches[0].clientY
			}
			updateSwipeMove(data);
			updatePosition();
		}
	}
	function swipeEnd(ev){
		var e = ev.originalEvent;
		var gallery = $(ev.delegateTarget);
		var data = gallery.data("ignitebox-swipe");
		if(typeof data != "undefined"){
			gallery.removeClass('swiping');
			var direction = 0;
			var swipeDuration = new Date() - data.startTime;
			var movementNeeded = 0.5
			if(swipeDuration < 300){
				movementNeeded = 0.2;
			}
			if(Math.abs(data.movePerc.x) > movementNeeded) {
				if(data.movePerc.x < 0) {
					if(data.currentIndex < data.lastIndex)
						direction = 1;
				} else {
					if(data.currentIndex > 0)
						direction = -1;
				}
			}
			moveSlide(gallery, direction);
			gallery.removeData('ignitebox-swipe');
		}
	}

	function updateSwipeMove(data){
		data.move = {
			x: data.current.x - data.start.x,
			y: data.current.y - data.start.y
		};
		var windowWidth = $(window).width();
		var windowHeight = $(window).height();
		data.movePerc = {
			x: Math.abs(data.move.x) / windowWidth,
			y: Math.abs(data.move.y) / windowHeight
		};
		if(data.move.x < 0)
			data.movePerc.x = data.movePerc.x * -1;

		if(data.move.y < 0)
			data.movePerc.y = data.movePerc.y * -1;

		var pos = (data.currentIndex - data.movePerc.x);
		if(pos < 0) {
			pos = 0;
			/*var cleanData = {
				start: {
					x: data.current.x,
					y: data.current.y
				},
				move: {
					x: 0,
					y: 0
				},
			};
			cleanData.movePerc = $.extend(true, {}, cleanData.move);
			data = $.extend(true, data, cleanData);*/
		}
		pos = pos * 100;
		data.pos = pos;
	}





	//PHPJS helpers
	function array_diff(arr1) {
		var retArr = {},
			argl = arguments.length,
			k1 = '',
			i = 1,
			k = '',
			arr = {};

		arr1keys: for (k1 in arr1) {
			for (i = 1; i < argl; i++) {
				arr = arguments[i];
				for (k in arr) {
					if (arr[k] === arr1[k1]) {
						// If it reaches here, it was found in at least one array, so try next value
						continue arr1keys;
					}
				}
				retArr[k1] = arr1[k1];
			}
		}
		return retArr;
	}
	function array_values(input) {
		var tmp_arr = [],
		key = '';

		if (input && typeof input === 'object' && input.change_key_case) { // Duck-type check for our own array()-created PHPJS_Array
			return input.values();
		}

		for (key in input) {
			tmp_arr[tmp_arr.length] = input[key];
		}

		return tmp_arr;
	}


	//polyfills
	//requestAnimationFrame
	var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
	if (!window.requestAnimationFrame){
		(function (global) {
		    var callbacksQueue = [];

		    global.setInterval(function () {
		        for (var i = 0; i < callbacksQueue.length; i++) {
		            if (callbacksQueue[i] !== false) {
		                callbacksQueue[i].call(null);
		            }
		        }

		        callbacksQueue = [];
		    }, 1000 / 60);

		    global.requestAnimationFrame = function (callback) {
		        return callbacksQueue.push(callback) - 1;
		    }

		    global.cancelAnimationFrame = function (id) {
		        callbacksQueue[id] = false;
		    }
		}(window));
	}
})(jQuery)