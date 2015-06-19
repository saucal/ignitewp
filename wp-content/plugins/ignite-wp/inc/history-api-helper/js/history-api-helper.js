(function($){
	var SAUCAL_HISTORY_API = function(){
		this.popped = ('state' in window.history && window.history.state !== null);
	    this.popped = false;
	    this.initialURL = location.href;
	    this.initialTitle = document.title;

	    this.evtElem = $("<div/>");

	    this.on = $.proxy(this.evtElem.on, this.evtElem);
	    this.one = $.proxy(this.evtElem.one, this.evtElem);
	    this.off = $.proxy(this.evtElem.off, this.evtElem);
	    this.trigger = $.proxy(this.evtElem.trigger, this.evtElem);

	    this.popping = false;
	    var self = this;

		$(window).bind('popstate', function(event){
	        // Ignore inital popstate that some browsers fire on page load
	        var initialPop = !historyAPI.popped && location.href == historyAPI.initialURL;
	        historyAPI.popped = true;
	        if (initialPop) return;

	        var state = event.originalEvent.state;

	        var evt = $.Event("popstate");

	        var fixed = []

	        if(state !== null && typeof state["ajaxAPI"] != "undefined") {
	        	fixed = [state["ajaxAPI"].state, state["ajaxAPI"].title, location.href];
	        } else if(state === null) {
	        	var ret;
	        	if(location.href == historyAPI.initialURL) {
	        		fixed = [{}, historyAPI.initialTitle, historyAPI.initialURL];
	        	} else {
			        fixed = [null, null, location.href];
	        	}
	        }

	        self.popping = true;
	        historyAPI.trigger(evt, fixed);
	        self.popping = false;
	        if(!evt.isDefaultPrevented() && fixed[1] !== null) {
	        	historyAPI.doPopState.apply(historyAPI, fixed);
	        }
	    });
	}

	var getLocationObject = function(url) {
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

	var HTMLtoText = function(html) {
		var elem = $('<textarea />');
		var varTitle = elem.html(html).text();
		elem.remove();
		return varTitle;
	}

	SAUCAL_HISTORY_API.prototype.pushState = function(state, title, href){
		if(this.popping)
			return;
    	var evt = $.Event("pushstate");
    	title = HTMLtoText(title);
    	this.trigger(evt, [href]);
    	if(historyAPI.historyApiSupported() && !evt.isDefaultPrevented()){
    		history.pushState({
    			ajaxAPI: {
    				state: state,
    				title: title
				}
			}, title, href);
    		document.title = title;
    		this.analyticsPush(title, href);
    		this.popped = true;
    	}
    	return evt;
    }
    SAUCAL_HISTORY_API.prototype.replaceState = function(state, title, href){
    	var evt = $.Event("replacestate");
    	title = HTMLtoText(title);
    	this.trigger(evt, [href]);
    	if(historyAPI.historyApiSupported() && !evt.isDefaultPrevented()){
    		history.replaceState({
    			ajaxAPI: {
    				state: state,
    				title: title
				}
			}, title, href);
    		document.title = title;
    		this.analyticsPush(title, href);
    	}
    	return evt;
    }
    SAUCAL_HISTORY_API.prototype.doPopState = function(state, title, href) {
    	title = HTMLtoText(title);
    	if(historyAPI.historyApiSupported()){
    		document.title = title;
    		this.analyticsPush(title, href);
    	}
    }
    SAUCAL_HISTORY_API.prototype.analyticsPush = function(title, url) {
    	var loc = getLocationObject(url);
    	var analyticsPath = loc.pathname + loc.search + loc.hash;
		if(typeof ga != "undefined") {
			ga('send', 'pageview', {
				'page': analyticsPath,
				'title': title
			});
		}
		if(typeof _gaq != "undefined") {
			_gaq.push(['_trackPageview', analyticsPath]);
		}
    }

    SAUCAL_HISTORY_API.prototype.getState = function(){
    	if(this.historyApiSupported()) {
    		var state = window.history.state;
    		if(state !== null && typeof state["ajaxAPI"] != "undefined") {
    			return state["ajaxAPI"].state;
    		} else {
    			return {};
    		}
    	}
    }

	SAUCAL_HISTORY_API.prototype.historyApiSupported = function(){
		return !!(window.history && history.pushState);
	}

	window.historyAPI = new SAUCAL_HISTORY_API();
})(jQuery);
