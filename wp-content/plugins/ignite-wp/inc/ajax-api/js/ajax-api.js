(function($){
	$.fn.ajaxAPIDataProxy = function(obj) {
		return this.data("ajaxAPIProxy", obj);
	}
	$.fn.ajaxAPIData = function(prop, val) {
		var data = this.data("ajaxAPIProxy");
		if(typeof data == "undefined")
			data = this.data("ajaxAPI");
		else
			data = data.data("ajaxAPI"); //get data from the proxied elem


		if(!data){
			data = {}
			this.data("ajaxAPI", data);
		}
		if(typeof prop == "undefined") {
			return data;
		} else if(typeof prop == "object") {
			for(pr in prop) {
				val = prop[pr];
				data[pr] = val;
			}
		} else {
			if(typeof val == "undefined"){
				if(typeof data[prop] != "undefined")
					return data[prop]
				else
					return undefined;
			} else {
				data[prop] = val;
				return this;
			}
		}
	}

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

	window.getLocationObject = function(url) {
		var a = document.createElement('a');
	    a.href = url;
	    return {
	    	hash: a.hash,
	    	host: a.host,
	    	hostname: a.hostname,
	    	href: a.href,
	    	pathname: a.pathname,
	    	port: a.port,
	    	protocol: a.protocol,
	    	search: a.search
	    }
	}

	window.urlsEqual = function(a, b) {
		a = getLocationObject(a);
		b = getLocationObject(b);
		var ret = true;
		var keys = ["host", "hostname", "pathname", "port", "protocol", "search"];
		for(var i in keys) {
			if(a[keys[i]] != b[keys[i]]) {
				ret = false;
				break;
			}
		}
		return ret;
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

	window.arrayClean = function(array){
		var newArray = [];
		for(var i=0;i<array.length;i++) {
			if(typeof array[i] != "undefined")
				newArray.push(array[i]);
		}
		return newArray;
	}

	var SAUCAL_AJAX_BUFFER = function(api){
		this.buffer = $();
		this.api = api;
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
					origTitle: newElem.data("ajax-title") || document.title,
					aliasTitle: newElem.data("ajax-alias-title"),
					bodyClass: $("body").attr("class"),
					alias: newElem.data("ajax-alias")
				}
			}, params);
			
			if(newElem.data("ajax-alias")) {
				var aliasesVisible = this.getByAlias(newElem.data("ajax-alias"));
				if(aliasesVisible.length == 0)
					ret.ajaxAPIData("is-main-alias", true);
			}

			params.data.title = params.data.origTitle;
			if(compareURLs(clearHashFromURL(newElem.data("ajax-alias")), clearHashFromURL(url))) {
				params.data.title = typeof params.data.aliasTitle == "undefined" ? params.data.origTitle : params.data.aliasTitle;
				params.data.aliasTitle = params.data.title;
			}

			this.api.triggerWith("pre-buffer", url, ret, [params]);

			if(typeof params.data == "object"){
				$.each(params.data, function(prop, val){
					if(params.replaceData === false){
						if(typeof ret.ajaxAPIData(prop) !== "undefined")
							return;
					}
					ret.ajaxAPIData(prop, val);
				})
			}
			
			this.buffer = this.buffer.add(ret);
		} else {
			
		}
		return ret;
	}
	SAUCAL_AJAX_BUFFER.prototype.getByAlias = function(url) {
		var mainAliases = this.buffer.filter(function(){
			return !!$(this).ajaxAPIData("is-main-alias");
		});
		var thisUrlAliases = mainAliases.filter(function(){
			return compareURLs(clearHashFromURL($(this).data("ajax-alias")), clearHashFromURL(url));
		});
		return thisUrlAliases;
	}
	SAUCAL_AJAX_BUFFER.prototype.get = function(url, params){
		if(typeof url == "function"){
			return this.buffer.filter(url);
		} else {
			var aliasesVisible = this.getByAlias(url);
			if(aliasesVisible.length > 0)
				return aliasesVisible.first().ajaxAPIData("aliasing-as", clearHashFromURL(url));
			else //if we didn't find aliases, go with the standard search
				return this.buffer.filter(function(){
					return compareURLs(clearHashFromURL($(this).ajaxAPIData("url")), clearHashFromURL(url));
				});
		}
	}

	var contentBuffer;	
	
	var SAUCAL_AJAX_QUEUE = function(){
		this.resetQueue();
		this.queueId = 0;
	}
	SAUCAL_AJAX_QUEUE.prototype.resetQueue = function(){
		this.queue = [];
		this.queueId++;
		this.working = false;
		return this.queueId;
	}
	SAUCAL_AJAX_QUEUE.prototype.getQueue = function() {
		return this.queueId;
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
	    this.initialTitle = document.title;

	    this.contentBuffer = new SAUCAL_AJAX_BUFFER(this);
	    contentBuffer = this.contentBuffer;

	    this.globalEvents = new SAUCAL_AJAX_EVENTS($(document));

	    SAUCAL_AJAX_EVENTS.proxy(this.globalEvents, this);

	    this.config = $.extend(true, {}, {
	    	contentSelector: "#content",
			menuSelector: {
				menu: "#header ul.menu",
				item: "li.menu-item"
			},
			loader: {
				show: null,
				hide: null
			},
			animDefGet: function(newContent, currContent) {
				return currContent.fadeOut(200).promise();
			}
		});

	    this.config = $.extend(true, this.config, ajax_api_config);

	    this.trigger("ajaxConfig", this);
	}
	SAUCAL_AJAX_API.prototype.setup = function(_config){
		this.config = $.extend(true, this.config, _config);
	}
    SAUCAL_AJAX_API.prototype.init = function(){
    	var content = $(this.config.contentSelector);
    	var bufferData = {};
    	ajaxAPI.trigger("beforeBufferInit", content, bufferData);
		bufferData = {
			data: bufferData
		};
		contentBuffer.add(content, window.location.href, bufferData);
    	this.triggerWith("showingPage", content, [content]);
		this.triggerWithOnce("contentReady", location.href, content, [content] );
		this.triggerWith("contentLoad", content, [content]);
		content.imagesLoaded().always(function(){
			ajaxAPI.triggerWith( "contentLoaded", location.href, content, [content] );
		});
		this.triggerWithOnce( "contentFirstLoad", content, [content] );
    }
    SAUCAL_AJAX_API.prototype.markLinks = function(href){
    	var links = $(ajaxAPI.config.menuSelector.item+" a");

    	// clear classes
    	links.each(function(){
			$(this).parentsUntil(ajaxAPI.config.menuSelector.menu, ajaxAPI.config.menuSelector.item)
					.removeClass("current-menu-item").removeClass("current_page_item")
					.removeClass("current_page_parent")
					.removeClass("current_page_ancestor")
					.removeClass("current-page-parent")
					.removeClass("current-page-ancestor")
					.removeClass("current-menu-parent")
					.removeClass("current-menu-ancestor")
		});

    	// get current links
    	var currentLinks = links.filter(function(){
			return compareURLs(clearHashFromURL($(this).attr("href")), href);
		});

    	// if there are current links add classes to them.
		if(currentLinks.length > 0) {
			currentLinks.each(function(){
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
	}
	SAUCAL_AJAX_API.prototype.hasToReplaceClick = function(link){
		var url = $(link).prop("href");
		var urlData = getLocationObject(url);

		//check same domain
		if(urlData.host != window.location.host)
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
    SAUCAL_AJAX_API.prototype.getPage = function(url, linkElem) {
    	if(typeof url !== "string" && typeof url != "undefined"){
    		linkElem = url;
    		url = linkElem.prop("href");
    	}

    	if(typeof linkElem == "undefined")
    		linkElem = $();

    	var def = $.Deferred();
    	var buffer = contentBuffer.get(url);
		if(buffer.length > 0){
			def.resolve(buffer);
		} else {
			ajaxAPI.showLoader(linkElem);

			var qId = ajaxQuery.resetQueue();
			ajaxQuery.get(addParam(url, "iframed", "1"), function(data){
				var ajaxBody = $("<div></div>").html(data);
				var content = ajaxBody.find(ajaxAPI.config.contentSelector);

				var bufferData = {
					origTitle: ajaxBody.find(".title-helper").text(),
					bodyClass: ajaxBody.find(".body-class-helper").removeClass('body-class-helper').attr("class"),
				};
				if(ajaxBody.find(".url-helper") != url) {
					var newUrl = ajaxBody.find(".url-helper").html();
					bufferData.alias = url;
					url = newUrl;
				}
				var hasToBuffer = ajaxAPI.trigger("beforeBuffer", content, ajaxBody, bufferData);
				var ret = $();
				if(!hasToBuffer.isDefaultPrevented()){
					var bufferData = {
						data: bufferData
					};
					ret = contentBuffer.add(content, url, bufferData)
				}
				if(ret.length > 0 && !ret.is($(ajaxAPI.config.contentSelector))) 
					if(qId == ajaxQuery.getQueue())
						def.resolve(ret);
				
				ajaxAPI.stopLoader(linkElem);
			});
		}
		return def.promise();
    }
    SAUCAL_AJAX_API.prototype.load = function (linkElem, doPush, def) {

    	if(doPush === undefined)
    		doPush = true;

    	var url;
    	if(typeof linkElem === "string"){
    		url = linkElem;
    		linkElem = $();
    	} else {
    		url = linkElem.prop("href");
    	}

    	if(typeof def == "undefined")
    		def = $.Deferred();

    	var currentContent = $(ajaxAPI.config.contentSelector);

    	//check that the target is not the same as the source

    	var urlData = getLocationObject(url);
    	var currLocation = getLocationObject(currentContent.ajaxAPIData("url"));

		if(clearHashFromURL(url) == currentContent.ajaxAPIData("url")) {
			var alias = currentContent.ajaxAPIData("aliasing-as");
			if(!alias || urlsEqual(alias, urlData.href)) {
				def.reject();
				if(window.location.hash != urlData.hash) {
					window.location.hash = urlData.hash;
				}
				return def.promise();
			}
		}
		//var iframe = $("#virtexBuffer");

		ajaxAPI.getPage(url, linkElem).done(function(buffer) {
			ajaxAPI.showPage(buffer, def, doPush);
		});

		return def.promise();
    }
	function isInDOMTree(node) {
	   // If the farthest-back ancestor of our node has a "body"
	   // property (that node would be the document itself), 
	   // we assume it is in the page's DOM tree.
	   return !!(findUltimateAncestor(node).body);
	}
	function findUltimateAncestor(node) {
	   // Walk up the DOM tree until we are at the top (parentNode 
	   // will return null at that point).
	   // NOTE: this will return the same node that was passed in 
	   // if it has no ancestors.
	   var ancestor = node;
	   while(ancestor.parentNode) {
	      ancestor = ancestor.parentNode;
	   }
	   return ancestor;
	}

	SAUCAL_AJAX_API.prototype.switchTo = function(newContent) {
		var currContent = $(ajaxAPI.config.contentSelector).first();
		if(currContent.is(newContent))
			return;

		currContent.addClass('ajax-leaving');
		newContent.addClass('ajax-entering');

		var effDef = ajaxAPI.config.animDefGet(newContent, currContent);
		var href = newContent.ajaxAPIData("url");

		ajaxAPI.markLinks(href);
		
		effDef.done(function(){
			if(!isInDOMTree(newContent.get(0)))
				newContent.hide().insertAfter(currContent);

			var e = ajaxAPI.triggerWith( "showingPage", href, newContent, [newContent] );
			if(!e.isDefaultPrevented()){
				if(!!newContent.ajaxAPIData("bodyClass")) {
					$("body").attr("class", newContent.ajaxAPIData("bodyClass"));
				}
			}

			currContent.detach();
			ajaxAPI.triggerWith( "contentLoad", href, newContent, [newContent] );
			ajaxAPI.triggerWithOnce( "contentFirstLoad", href, newContent, [newContent] );
			newContent.fadeIn(200, function(){
				newContent.imagesLoaded().always(function(){
					ajaxAPI.triggerWith( "contentLoaded", href, newContent, [newContent] );
				});
				currContent.add(newContent).removeClass('ajax-leaving ajax-entering');
			});
			ajaxAPI.triggerWith( "afterInitShow", href, newContent, [newContent] );
		})
	}

    SAUCAL_AJAX_API.prototype.showPage = function(newContent, def, doPush){
    	var thisAPI = this;
    	if(typeof def === "undefined")
    		def = $.Deferred();

		var href = newContent.ajaxAPIData("url");
		
		ajaxAPI.markLinks(href);

		var currContent = $(ajaxAPI.config.contentSelector);

		var effDef = $.Deferred();
		var ret = thisAPI.triggerWith("prevHideOldContent", href, $(document), [newContent, currContent, effDef, def]);
		if(ret.isDefaultPrevented()) {
			return def.promise();
		}

		if(currContent.is(newContent)) {
			def.resolveWith(newContent, [newContent]);
			return def.promise();;
		}

		currContent.addClass('ajax-leaving');
		newContent.addClass('ajax-entering');

		effDef = ajaxAPI.config.animDefGet(newContent, currContent);

		effDef.done(function(){
			if(!isInDOMTree(newContent.get(0)))
				newContent.hide().insertAfter(currContent);

			var e = thisAPI.triggerWith( "showingPage", href, newContent, [newContent] );
			if(!e.isDefaultPrevented()){
				if(doPush) 
					historyAPI.pushState({}, newContent.ajaxAPIData("title"), href);

				if(!!newContent.ajaxAPIData("bodyClass")) {
					$("body").attr("class", newContent.ajaxAPIData("bodyClass"));
				}
			}

			thisAPI.triggerWithOnce( "contentReady", href, newContent, [newContent] );
			currContent.detach();
			thisAPI.triggerWith( "contentLoad", href, newContent, [newContent] );
			thisAPI.triggerWithOnce( "contentFirstLoad", href, newContent, [newContent] );
			newContent.fadeIn(200, function(){
				newContent.imagesLoaded().always(function(){
					thisAPI.triggerWith( "contentLoaded", href, newContent, [newContent] );
				});
				currContent.add(newContent).removeClass('ajax-leaving ajax-entering');
				def.resolveWith(newContent, [newContent]);
			});
			thisAPI.triggerWith( "afterInitShow", href, newContent, [newContent] );
		})
		return def.promise();
	}

	window.ajaxAPI = new SAUCAL_AJAX_API();
	
	$(function(){
		ajaxAPI.init();
	})    
    
	if(!!ajaxAPI.config.autoInit) {
	    // Handle click event of all links with href not starting with http, https or #
	    $(document).on('click', ajaxAPI.config.linkSelector, function(e){
			var thisLink = $(this);
			if(!thisLink.prop("href"))
				return;

			var evt = ajaxAPI.triggerWith("ajaxgetting", thisLink.prop("href"));
			if(evt.isDefaultPrevented()) {
		        e.preventDefault();
		    } else {
		    	if(ajaxAPI.hasToReplaceClick(thisLink) && !e.isDefaultPrevented() && historyAPI.historyApiSupported()){
		        	e.preventDefault();
			        ajaxAPI.load(thisLink, true);
		    	};
			}
	    });
	}

	$.fn.triggerAjaxAPI = function() {
		var def = $.Deferred();
		this.promise = $.proxy( def.promise, def );
		return this.on("click", function(e){
			var thisLink = $(this);
			if(!thisLink.prop("href"))
				return;
			
			var evt = ajaxAPI.triggerWith("ajaxgetting", thisLink.prop("href"));
			if(evt.isDefaultPrevented()) {
		        e.preventDefault();
		    } else {
				if(ajaxAPI.hasToReplaceClick(thisLink) && !e.isDefaultPrevented() && historyAPI.historyApiSupported()){
		        	e.preventDefault();
			        ajaxAPI.load(thisLink, true, def);
		    	};
		    }
		});
	}

	historyAPI.on("popstate", function(e, state, title, url) {
		if(state !== null && title !== null) {
			var evt = ajaxAPI.triggerWith("saucal_popstate", url, [state, title, url]);
			if(!evt.isPropagationStopped())
	        	ajaxAPI.load(location.href, false);
		} else {
			e.preventDefault();
			ajaxAPI.load(location.href, false).done(function(newContent){
	        	historyAPI.replaceState({}, newContent.ajaxAPIData("title"), newContent.ajaxAPIData("url"));
	        });
		}
	});
})(jQuery)
	