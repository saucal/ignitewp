(function($){
	window.arrayClean = function(array){
		var newArray = [];
		for(var i=0;i<array.length;i++) {
			if(typeof array[i] != "undefined")
				newArray.push(array[i]);
		}
		return newArray;
	}
	
	var SAUCAL_AJAX_EVENTS = function(defaultScope){
		this.defaultScope = this;
		if(defaultScope)
			this.defaultScope = defaultScope;
		this.events = {};
	}
	SAUCAL_AJAX_EVENTS.prototype.attachEvt = function(evt, url, fn, once) {
		if(!evt)
			throw new Exception("noEvt", "You're doing it wrong");

		if(typeof url == "function") {
			fn = url;
			url = undefined;
		}

		if(typeof this.events[evt] == "undefined")
			this.events[evt] = [];

		this.events[evt].push({
			filter: url,
			once: once,
			fn: fn 
		})

		return this;
	}
	SAUCAL_AJAX_EVENTS.prototype.off = function(evt, url, fn) {
		if(!evt)
			throw new Exception("noEvt", "You're doing it wrong");

		if(typeof this.events[evt] == "undefined")
			return;

		if(this.events[evt].length == 0)
			return;

		if(typeof url == "function") {
			fn = url;
			url = undefined;
		}

		var localEvents = arrayClean(this.events[evt]);
		for(var j=0;j<this.events[evt].length;j++) {
			var curr = this.events[evt][j];
			if(!!url && !!fn) {
				if(curr.filter == url && curr.fn === fn)
					localEvents[j] = undefined;
			} else if(!!url) {
				if(curr.filter == url)
					localEvents[j] = undefined;
			} else if(!!fn) {
				if(curr.fn === fn)
					localEvents[j] = undefined;
			} else {
				localEvents[j] = undefined;
			}
		}
		var newEvents = arrayClean(localEvents);
		this.events[evt] = newEvents;
	}
	SAUCAL_AJAX_EVENTS.prototype.on = function(evt, url, fn) {
		return this.attachEvt(evt, url, fn, false);
	} 
	SAUCAL_AJAX_EVENTS.prototype.one = function(evt, url, fn) {
		return this.attachEvt(evt, url, fn, true);
	} 
	SAUCAL_AJAX_EVENTS.prototype.eventTriggered = function(evt, elem) {
		if(typeof elem.data("ajax_evts") == "undefined")
			return false;

		if(typeof elem.data("ajax_evts")[evt] == "undefined")
			return false;

		return true;
	}
	SAUCAL_AJAX_EVENTS.prototype.countTrigger = function(evt, elem) {
		if(typeof elem.data("ajax_evts") == "undefined")
			elem.data("ajax_evts", {})

		var data = elem.data("ajax_evts");

		if(typeof data[evt] == "undefined")
			data[evt] = 0;

		data[evt]++;
	}
	SAUCAL_AJAX_EVENTS.prototype.triggerWithOnce = function(evt, url, scope, params) {
		return this.triggerWith.call(this, evt, url, scope, params, true);
	}

	SAUCAL_AJAX_EVENTS.prototype.triggerOnce = function(evt) {
		return this.trigger.call(this, true, evt);
	}
	SAUCAL_AJAX_EVENTS.prototype.triggerWith = function(evt, url, scope, params, once) {
		var eventObj;
		if(typeof evt == "string") {
			eventObj = jQuery.Event( evt );
		} else {
			eventObj = evt;
			evt = evt.type;
		}

		if(typeof url != "string" && typeof url != "undefined"){
			if(jQuery.isArray(scope) && typeof params == "undefined")
				params = scope;

			scope = url;
			url = undefined;
		}

		if(jQuery.isArray(scope) && typeof params == "undefined") {
			params = scope;
			scope = undefined;
		}

		if(typeof params == "undefined")
			params = [];

		if(!!url) 
			eventObj.url = url;

		if(!!scope)
			eventObj.targetScope = scope;

		params.unshift(eventObj);

		if(!!once)
			params.unshift(true);
		else
			params.unshift(false);

		return this.trigger.apply(this, params);
	}
	SAUCAL_AJAX_EVENTS.prototype.trigger = function(once, evt) {
		var eventObj;
		var fnParams;
		if(typeof once != "boolean") {
			fnParams = arrayClean(arguments).slice(1);
			evt = once;
			once = false;
		} else {
			fnParams = arrayClean(arguments).slice(2);
		}

		if(typeof evt == "string") {
			eventObj = jQuery.Event( evt );
		} else {
			eventObj = evt;
			evt = evt.type;
		}

		fnParams.unshift(eventObj);

		var fnScope = this.defaultScope;
		if(typeof eventObj.targetScope != "undefined")
			fnScope = eventObj.targetScope;

		if(!!once && typeof fnScope.data != "undefined") {
			if(this.eventTriggered(evt, fnScope)){
				this.countTrigger(evt, fnScope);
				return;
			}
		}

		this.countTrigger(evt, fnScope);

		if(typeof this.events[evt] != "undefined") {
			var url;
			if(typeof eventObj.url != "undefined")
				url = eventObj.url;

			var localEvents = arrayClean(this.events[evt]);
			for(var j=0;j<localEvents.length;j++) {
				var curr = localEvents[j];
				if((!!curr.filter && curr.filter == url) || (!(!!url) && !(!!curr.filter))) {
					curr.fn.apply(fnScope, fnParams);
					if(!!curr.once)
						this.off(evt, curr.fn);
					if(eventObj.isImmediatePropagationStopped())
						break;
				}
			}
		}

		if(typeof fnScope["trigger"] != "undefined") {
			fnParams.shift();
			fnScope.trigger(eventObj, fnParams);
		}

		return eventObj;
	}

	SAUCAL_AJAX_EVENTS.proxy = function(from, to) {
		to.on = $.proxy(from.on, from);
	    to.off = $.proxy(from.off, from);
	    to.one = $.proxy(from.one, from);
	    to.trigger = $.proxy(from.trigger, from);
	    to.triggerWith = $.proxy(from.triggerWith, from);
	    to.triggerOnce = $.proxy(from.triggerOnce, from);
	    to.triggerWithOnce = $.proxy(from.triggerWithOnce, from);
	}

	window.SAUCAL_AJAX_EVENTS = SAUCAL_AJAX_EVENTS;
})(jQuery)