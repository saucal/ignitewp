(function($){
	String.prototype.endsWith = function(str){
		return (this.lastIndexOf(str) + str.length - this.length) == 0 ? true : false;
	}
	String.prototype.startsWith = function(str){
		return this.indexOf(str) == 0 ? true : false;
	}
	window.clearHashFromURL = function(url){
		var a = document.createElement('a');
	    a.href = url;
	    var str = a.href;
	    if(a.hash.length > 0){
	    	str = str.replace(a.hash, "");
	    } else {
	    	str = str.replace("#", "");
	    }
	    return str;
	}
	window.compareURLs = function(a, b){
		if(a == b){
			return true;
		} else if(a.endsWith("/") && a == b+"/"){
			return true;
		} else if(b.endsWith("/") && b == a+"/"){
			return true;
		} else {
			return false;
		}
	}
	window.addParam = function(url, _param, _value) {
	    var a = document.createElement('a');
	    a.href = url;

	    var hasParams = a.search.substring(0,1) == "?";
	    var params = hasParams ? a.search.substring(1).split("&") : [];
	    for(i=0;i<params.length;i++){
	    	paramVal = params[i].split("=");
	    	//var value = typeof paramVal[1] !== undefined ? paramVal[1] : "";
	    	if(paramVal[0] == _param){
	    		params[i] = _param+"="+_value;
	    		a.search = "?" + params.join("&");
	    		return a.href;
	    	}
	    }

	    a.search = "?" + (params.length > 0 ? params.join("&") + "&" : "") + _param + "=" + _value;

	    return a.href;
	}

	var SAUCAL_AJAX_BUFFER = function(){
		this.buffer = $();
		this.callbacks = {};
	}
	SAUCAL_AJAX_BUFFER.prototype.on = function(evt, callback){
		if(typeof this.callbacks[evt] == "undefined"){
			this.callbacks[evt] = [];
		}
		this.callbacks[evt].push(callback);
	}
	SAUCAL_AJAX_BUFFER.prototype.trigger = function(evt, elem, params){
		if(typeof this.callbacks[evt] == "undefined" || this.callbacks[evt].length == 0){
			return false;
		}
		$.each(this.callbacks[evt], function(i, cb){
			cb.apply(elem, params);
		})
		//this.callbacks[evt].push(callback);
	}
	SAUCAL_AJAX_BUFFER.prototype.add = function(newElem, url, params){
		if(typeof url == "undefined")
			url = window.location.href;
		if(typeof params == "undefined")
			params = {};

		var ret = this.get(url);

		if(ret.length == 0){			
			ret = newElem;

			params = $.extend(true, {
				replaceData: false,
				data: {
					url: clearHashFromURL(url),
					title: document.title
				}
			}, params);
			
			if(typeof params.data == "object"){
				$.each(params.data, function(prop, val){
					if(params.replaceData === false){
						if(typeof ret.data(prop) !== "undefined")
							return;
					}
					ret
					.data(prop, val)
					.attr("data-"+prop, val)
				})
			}

			this.trigger("pre-buffer", ret, [url, params]);
			
			this.buffer = this.buffer.add(ret);
		} else {
			
		}
		return ret;
	}
	SAUCAL_AJAX_BUFFER.prototype.get = function(url, params){
		if(typeof url == "function"){
			return this.buffer.filter(url);
		} else {
			return this.buffer.filter(function(){
				return $(this).data("url") === clearHashFromURL(url);
			});
		}
	}

	var contentBuffer = new SAUCAL_AJAX_BUFFER();
	

	
	
	var SAUCAL_AJAX_QUEUE = function(){
		this.resetQueue();
	}
	SAUCAL_AJAX_QUEUE.prototype.resetQueue = function(){
		this.queue = [];
		this.queueId = Math.random();
		this.working = false;
	}
	SAUCAL_AJAX_QUEUE.prototype.enqueue = function(method, url, data, callback){
		var hasToStart = this.queue.length == 0 ? true : false;
		this.queue.push([method, url, data, callback]);
		if(hasToStart)
			this.dequeue();
	}
	SAUCAL_AJAX_QUEUE.prototype.dequeue = function(){
		var thisQueue = this;
		if(this.queue.length > 0 && this.working == false){
			var qId = this.queueId;
			this.working = true;
			var thisReq = this.queue.shift();
			var method = thisReq[0],
				url = thisReq[1],
				data = thisReq[2],
				callback = thisReq[3];

			if(typeof data == "function") {
				callback = data;
				data = undefined;
			}
			$.ajax(url, {
				method: method,
				data: data,
				complete: function(jqXHR){
					if(qId != thisQueue.queueId)
						return;
					callback.apply(window, [jqXHR.responseText]);
					thisQueue.working = false;
					thisQueue.dequeue();
				}
			})
		}
	}
	SAUCAL_AJAX_QUEUE.prototype.get = function(url, data, callback){
		this.enqueue("GET", url, data, callback);
	}
	SAUCAL_AJAX_QUEUE.prototype.post = function(url, data, callback){
		this.enqueue("POST", url, data, callback);
	}

	window.ajaxQuery = new SAUCAL_AJAX_QUEUE;	


	var SAUCAL_AJAX_API = function(){
		// Used to detect initial (useless) popstate.
	    // If history.state exists, pushState() has created the current entry so we can
	    // assume browser isn't going to fire initial popstate
	    this.popped = ('state' in window.history && window.history.state !== null);
	    this.popped = false;
	    this.initialURL = location.href;

	    this.config = $.extend(true, {}, {
	    	contentSelector: "#content",
			menuSelector: {
				menu: "ul.menu",
				item: "li.menu-item"
			},
			loader: {
				show: null,
				hide: null
			},
			beforeBuffer: function(content){
				return true;
			},
			changeBufferData: function(bufferData, content, ajaxBody){
				return bufferData;
			},
			callbacks: {
				prevHideOldContent: function(){},
				afterShow: function(){},
				prevShow: function(){},
				afterInitShow: function(){}
			}
		});

	    var recursiveApiEval = function(items) {
	    	$.each(items, function(i, item){
	    		if(typeof item == "string"){
	    			if(item.indexOf("function") == 0) {
	    				try {
	    					item = eval("("+item+")");
	    				} catch(e) {
	    					console.error(e);
	    				}
	    			}
	    			items[i] = item;
	    		}
	    		if(typeof item == "object" && item !== null)
	    			items[i] = recursiveApiEval(item);
	    	})
	    	return items;
	    }

	    ajax_api_config = recursiveApiEval(ajax_api_config);

	    this.config = $.extend(true, this.config, ajax_api_config);
	}
	SAUCAL_AJAX_API.prototype.setup = function(_config){
		this.config = $.extend(true, this.config, _config);
	}
	
	SAUCAL_AJAX_API.prototype.historyApiSupported = function(){
		return !!(window.history && history.pushState);
	}
	SAUCAL_AJAX_API.prototype.pushState = function(state, title, href){
    	if(this.historyApiSupported()){
    		history.pushState(state, title, href);
    		this.popped = true;
    	}
    }
    SAUCAL_AJAX_API.prototype.replaceState = function(state, title, href){
    	if(this.historyApiSupported()){
    		history.replaceState(state, title, href);
    	}
    }
    SAUCAL_AJAX_API.prototype.init = function(){
    	var content = $(this.config.contentSelector);
    	contentBuffer.add(content);
		content.trigger("showingPage", [content]);
    	content.trigger("contentReady", [content]);
		content.data("contentAlreadyLoaded", true);
		content.trigger("contentLoad", [content]);
    }
    SAUCAL_AJAX_API.prototype.markLinks = function(href){
		$(ajaxAPI.config.menuSelector.menu+" "+ajaxAPI.config.menuSelector.item+" a").each(function(){
			$(this).parentsUntil(ajaxAPI.config.menuSelector.menu, ajaxAPI.config.menuSelector.item)
					.removeClass("current-menu-item").removeClass("current_page_item")
					.removeClass("current_page_parent")
					.removeClass("current_page_ancestor")
					.removeClass("current-page-parent")
					.removeClass("current-page-ancestor")
					.removeClass("current-menu-parent")
					.removeClass("current-menu-ancestor")
		}).filter(function(){
			return compareURLs(clearHashFromURL($(this).attr("href")), href);
		}).each(function(){
			$(this).parent().addClass("current-menu-item").addClass("current_page_item")
				.parentsUntil(ajaxAPI.config.menuSelector.menu, ajaxAPI.config.menuSelector.item)
					.addClass("current_page_parent")
					.addClass("current_page_ancestor")
					.addClass("current-page-parent")
					.addClass("current-page-ancestor")
					.addClass("current-menu-parent")
					.addClass("current-menu-ancestor");
		});
	}
	SAUCAL_AJAX_API.prototype.hasToReplaceClick = function(link){
		
		var url = $(link).prop("href");

		//check same domain
		if($(link).get(0).host != window.location.host)
			return false;

		//check if it's not a WP-Admin url we're accessing.
		if(url.startsWith(ajax_api.admin_url))
			return false;

		//check if it's not a WP-login url we're accessing.
		if(url.startsWith(ajax_api.login_url))
			return false;

		//avoid extensions that are known filetypes
		var ret = true;
		$.each(["zip", "jpg", "gif", "png", "bmp", "pdf", "mp3"], function(i, ext){
			if(url.endsWith("."+ext))
				ret = false;
		});
		if(!ret)
			return false;

		//if we got here we assume we need to handle the request via AJAX
    	return true;
    }

    SAUCAL_AJAX_API.prototype.showLoader = function(linkElem){
    	var thisScope;
    	if(linkElem.length > 0){
    		thisScope = linkElem.get(0);
    	} else {
    		thisScope = window;
    	}
    	linkElem.addClass('ajax-loading');
    	if(typeof this.config.loader.show == "function"){
    		this.config.loader.show.call(thisScope)
    	}
    }
    SAUCAL_AJAX_API.prototype.stopLoader = function(linkElem){
    	var thisScope;
    	if(linkElem.length > 0){
    		thisScope = linkElem.get(0);
    	} else {
    		thisScope = window;
    	}
    	linkElem.removeClass('ajax-loading');
    	if(typeof this.config.loader.hide == "function"){
    		this.config.loader.hide.call(thisScope)
    	}
    }

    SAUCAL_AJAX_API.prototype.load = function (linkElem, doPush) {

    	if(doPush === undefined)
    		doPush = true;

    	var url;
    	if(typeof linkElem === "string"){
    		url = linkElem;
    		linkElem = $();
    	} else {
    		url = linkElem.prop("href");
    	}

    	var def = $.Deferred();

    	//check that the target is not the same as the source
		if(clearHashFromURL(url) == clearHashFromURL($(ajaxAPI.config.contentSelector).data("url"))){
			def.reject();
			return def.promise();
		}
		//var iframe = $("#virtexBuffer");

		ajaxQuery.resetQueue();

		if(doPush) 
			ajaxAPI.pushState({}, null, url);

		var buffer = contentBuffer.get(url);
		if(buffer.length > 0){
			ajaxAPI.showPage(buffer);
		} else {
			ajaxAPI.showLoader(linkElem);
			ajaxQuery.get(addParam(url, "iframed", "1"), function(data){

				var ajaxBody = $("<div></div>").html(data);
				var content = ajaxBody.find(ajaxAPI.config.contentSelector);

				var hasToBuffer = ajaxAPI.config.beforeBuffer(content);
				var ret = $();
				if(hasToBuffer){
					var bufferData = ajaxAPI.config.changeBufferData({
						data: {
							title: ajaxBody.find(".title-helper").text()
						}
					}, content, ajaxBody);
					ret = contentBuffer.add(content, url, bufferData)
				}
				if(ret.length > 0 && !ret.is($(ajaxAPI.config.contentSelector))) 
					ajaxAPI.showPage(ret);
				
				ajaxAPI.stopLoader(linkElem);
			});
		}

		return def.promise();
    }

    SAUCAL_AJAX_API.prototype.showPage = function(newContent){
		var href = newContent.data("url");
		
		ajaxAPI.markLinks(href);

		ajaxAPI.config.callbacks.prevHideOldContent.call(newContent);

		$(ajaxAPI.config.contentSelector).fadeOut(200, function(){
			newContent.hide().insertAfter($(this));

			var e = jQuery.Event( "showingPage" );
			newContent.trigger( e, [newContent] );
			if(!e.isDefaultPrevented()){
				document.title = newContent.data("title");
			}

			if(!newContent.data("contentAlreadyLoaded")){
				newContent.trigger("contentReady", [newContent]);
				newContent.data("contentAlreadyLoaded", true);
			}
			$(this).detach();
			ajaxAPI.config.callbacks.prevShow.call(newContent);
			newContent.trigger("contentLoad", [newContent]).fadeIn(200, function(){
				ajaxAPI.config.callbacks.afterShow.call(newContent);
			});
			ajaxAPI.config.callbacks.afterInitShow.call(newContent);
			
		})
	}

	window.ajaxAPI = new SAUCAL_AJAX_API();
	
	$(function(){
		ajaxAPI.init();
	})    
    

    // Handle click event of all links with href not starting with http, https or #
    $(document).on('click', 'a', function(e){
    	if(ajaxAPI.hasToReplaceClick($(this)) && !e.isDefaultPrevented() && ajaxAPI.historyApiSupported()){
	        e.preventDefault();
	        ajaxAPI.load($(this), true);
    	};
    });

    $(window).bind('popstate', function(event){
        // Ignore inital popstate that some browsers fire on page load
        var initialPop = !ajaxAPI.popped && location.href == ajaxAPI.initialURL;
        ajaxAPI.popped = true;
        if (initialPop) return;

        ajaxAPI.load(location.href, false);
    });
})(jQuery)
	