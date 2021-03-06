(function($){
	function rawurlencode(str) {
		str = (str + '').toString();

		return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
		replace(/\)/g, '%29').replace(/\*/g, '%2A');
	}

	var socialNetworkDefaults = {
		"mail": {
			url: "mailto:",
			html: '<i class="fa fa-envelope fa-fw"></i>',
			hoverColor: "#CCCCCC",
			vars: {
				"subject": "title",
				"body": "description"
			},
			encoding: "raw"
		},
		"facebook": {
			url: "https://www.facebook.com/sharer/sharer.php",
			size: [500,370],
			html: '<i class="fa fa-facebook fa-fw"></i>',
			hoverColor: "#0c6ab2",
			vars: {
				"u": "url"
			}
		},
		"twitter": {
			url: "https://twitter.com/intent/tweet",
			size: [500,370],
			html: '<i class="fa fa-twitter fa-fw"></i>',
			hoverColor: "#24a9e1",
			vars: {
				"url": "url",
				"original_referer": "referer",
				"text": "description"
			}
		},
		"pinterest": {
			url: "https://pinterest.com/pin/create/bookmarklet/",
			size: [800,450],
			html: '<i class="fa fa-pinterest fa-fw"></i>',
			hoverColor: "#f8122c",
			vars: {
				"media": "url",
				"url": "referer",
				"description": "description"
			}
		},
		"google-plus": {
			url: "https://plus.google.com/share",
			size: [480,460],
			html: '<i class="fa fa-google-plus fa-fw"></i>',
			hoverColor: "#e63a22",
			vars: {
				"url": "url"
			} 
		},
		"linkedin": {
			url: "http://www.linkedin.com/shareArticle",
			size: [480,460],
			html: '<i class="fa fa-linkedin fa-fw"></i>',
			hoverColor: "#2d90d1",
			vars: {
				"mini": {
					force: true
				},
				"url": "url"
			}
		},
		"reddit": {
			url: "http://www.reddit.com/static/button/button3.html",
			size: null,
			html: '<iframe src="REPLACE_URL" height="52" width="75" scrolling="no" frameborder="0"></iframe>',
			hoverColor: null,
			vars: {
				"width": {
					force: "69"
				},
				"url": "url"
			},
			iframed: true
		},
		"reddit-alt": {
			url: "http://www.reddit.com/submit",
			size: null,
			html: '<img src="http://www.reddit.com/static/spreddit5.gif" alt="submit to reddit" border="0" />',
			hoverColor: null,
			vars: {
				"url": "url"
			}
		}
	}

	$.socialLinksIcons = function(networks, val){
		if(typeof networks == "string") {
			var newNw = {};
			newNw[networks] = val;
			networks = newNw;
		}
		$.each(networks, function(network, icon){
			if(typeof socialNetworkDefaults[network] == "undefined")
				return;

			socialNetworkDefaults[network].html = icon;
		});
	}

	function getNetworkDefaults(network) {
		if(typeof socialNetworkDefaults[network] == "undefined")
			return;

		return socialNetworkDefaults[network];
	}
	$.getSocialLinks = function(networks, config) {
		config = $.extend(true, {
			url: window.location.href,
			referer: window.location.href,
			description: "Check this out",

			noEffects: false,
			showCount: false,
			customStrings: {
				noShares: "REPLACE_NUM",
				share1: "REPLACE_NUM",
				shares: "REPLACE_NUM"
			}
		}, config);
		var newNw = {}
		if(typeof networks == "string") {
			newNw[networks] = config;
			networks = newNw;
		} else if(Array.isArray(networks)) {
			for(i in networks) {
				var nw = networks[i];
				newNw[nw] = config;
			}
			networks = newNw;
		} else {
			$.each(networks, function(i, item){
				networks[i] = $.extend(true, networks[i], config);
			});
		}

		var list = $();

		$.each(networks, function(nw, config){
			list = list.add($.getSocialLink(nw, config));
		});

		return list;
	}

	var queues = {};
	function getAjaxCount(url) {
		if(typeof queues[url] != "undefined")
			return queues[url].promise();

		var def = $.Deferred();
		queues[url] = def;

		ajaxGetJSON("social-count", {
			post_url: url
		}, function(data, json){
			def.resolve(json);
		});

		return def.promise();
	}

	$.getSocialLink = function(network, config){
		var data = getNetworkDefaults(network);

		if(typeof data == "undefined") 
			return $();

		$.each(data.vars, function(i, item){
			if(typeof item == "object"){
				data.vars[i] = item.force;
			} else {
				data.vars[i] = config[item];
			}
		});

		var vars;
		if(data["encoding"] === "raw" ){
			vars = "";
			$.each(data.vars, function(i, item){
				if(vars.length > 0) vars += "&"
				vars += i + "=" + rawurlencode(item);
			});
		} else {
			vars = $.param(data.vars);
		}

		if(data.html.indexOf("REPLACE_URL") != -1){
			data.html = data.html.replace("REPLACE_URL", data.url + "?" + vars);
		}

		var link;
		if(data.url == null || data["iframed"] === true){
			link = $("<div>", {
				"class": "social-link"
			}).addClass(network).html(data.html)
		} else {
			link = $("<a>", {
				"class": "social-link",
				"href": "#",
				"click": function(e){
					e.preventDefault();
					if(!data.size) {
						window.location.href = data.url + "?" + vars;
					} else {
						window.open(data.url + "?" + vars, "_blank", 'width='+data.size[0]+',height='+data.size[1]);
					}
				}
			}).addClass(network).html(data.html)
		}

		if(config["noEffects"] === false) {
			link.addClass('to-nw-color')
		}

		if(config["showCount"] === true) {
			getAjaxCount(config.url).done(function(data) {
				if(typeof data[network] != "undefined") {
					data[network] = parseInt(data[network]);
					var num = data[network]+"";
					if(data[network] > 1000000) {
						num = parseFloat(data[network]/1000000).toFixed(1)+"M"
					} else if(data[network] > 1000) {
						num = parseFloat(data[network]/1000).toFixed(1)+"k"
					}

					var str = config.customStrings.shares;
					if(data[network] == 0)
						str = config.customStrings.noShares;
					if(data[network] == 1)
						str = config.customStrings.share1;

					link.append('<span class="social-count">'+str+'</span>');
				}
			})
		}

		return link;
	};
})(jQuery)
