(function($){
    function checkViewport(viewportList) {
        var winWidth = $(window).width();
        if(winWidth >= 1200 && viewportList.indexOf("lg") >= 0) {
            return true;
        }
        if(winWidth >= 992 && winWidth <= 1199 && viewportList.indexOf("md") >= 0) {
            return true;
        }
        if(winWidth >= 768 && winWidth <= 991 && viewportList.indexOf("sm") >= 0) {
            return true;
        }
        if(winWidth <= 767 && viewportList.indexOf("xs") >= 0) {
            return true;
        }
        return false;
    }
    function ifUndefined(val, def) {
        if(typeof val == "undefined")
            return def;
        return val;
    }
	function igniteWall(elems, globalOptions) {
		globalOptions = $.extend(true, {
			tolerance: 0.2,
			elementSelector: ".iw-item",
			bgParentSelector: ".iw-bg-parent"
		}, globalOptions);
		
		return $(elems).each(function(){
			var thisFreewall = $(this), thisEl = thisFreewall;
			if(thisFreewall.data("ignitewall"))
				return;

			thisFreewall.data("ignitewall", true);

			var options = $.extend(true, {}, globalOptions, {
                destroyIn: ifUndefined(thisFreewall.data("destroy-in"), ""),
			})

            if(options.destroyIn)
                options.destroyIn = options.destroyIn.split(" ");
            else
                options.destroyIn = [];

            if(options.destroyIn.length > 0 && typeof thisEl.data("ignitewall-watching") == "undefined") {
                thisEl.data("ignitewall-watching", true);
                function watchThis(){
                    if(checkViewport(options.destroyIn)) {
                        thisEl.ignitewallDestroy();
                    } else {
                        thisEl.ignitewall();
                    }
                }
                $(window).on("resize", watchThis);
                setTimeout(watchThis, 0);
            }

			var getRowsMax = function(){
				var width = $(window).width();
				var type = "xs";
				if(width >= 1200) {
					type = "lg";
				} else if(width < 1200 && width >= 992) {
					type = "md";
				} else if(width < 992 && width >= 768) {
					type = "sm";
				}
				return thisFreewall.data(type+"-rows") || 2
			};
			var items = thisFreewall.children(options.elementSelector);

			//set bg image
			items.find("img").each(function(){
				var thisEl = $(this);
				var parent = thisEl.closest(options.bgParentSelector);
				var checkSrc = function(){
					thisEl.css("opacity", "0");
					parent.css("background-image", 'url("'+thisEl.prop("src")+'")');
				}
				thisEl.on("lazyload", checkSrc);
				checkSrc();
			});

			var checkGrid = function(){
				var thisCheck = function(){
					if(!thisFreewall.data("ignitewall"))
						return; 
					
					items.css({
						"width": "",
						"display": ""
					}).find(".plus-symbol").remove();

					var rows = [];
					var addNewRow = function(){
						var row = {
							elems: $(),
							width: 0,
							idx: rows.length
						};
						rows.push(row);
						return row;
					}
					var getLastRow = function(){
						if(rows.length > 0){
							return rows[rows.length - 1];
						}
					}
					addNewRow();

					items.each(function(){
						var currRow = getLastRow();
						var currElem = $(this);
						var currWidth = currElem.outerWidth();

						if((currRow.width + currWidth) / thisFreewall.width() > (1 + options.tolerance)) {
							currRow = addNewRow();
						}
						currRow.elems = currRow.elems.add(currElem);
						currRow.width += currWidth;
					})

					var extraCount = 0;

					var cbs = [];
					$.each(rows, function(i, currRow){
						var missing = 1 - (currRow.width / thisFreewall.width());
						if(Math.abs(missing) < options.tolerance) {
							currRow.elems.each(function(){
								var currElem = $(this);
								var currWidth = currElem.outerWidth();
								var currPerc =  currWidth / thisFreewall.width();
								var newPerc = currPerc + (missing * currWidth / currRow.width);
								cbs.push(function(){
									currElem.css("width", (newPerc*100)+"%");
								})
							})
						}
						if(currRow.idx >= getRowsMax()) {
							currRow.elems.each(function(){
								extraCount++;
								var currElem = $(this);
								cbs.push(function(){
									currElem.hide();
								});
							});
						}
					})
					if(extraCount > 0) {
						var lastImageVisible = rows[getRowsMax() - 1].elems.last();
						var itemToAdd = lastImageVisible.find(options.bgParentSelector+" a");
						itemToAdd.append('<span class="plus-symbol">+'+extraCount+'</span>')
					}
					setTimeout(function(){
						for(i in cbs){
							cbs[i].apply(this, arguments);
						}
					}, 0);
				}

				thisFreewall.imagesLoaded()
					.progress(thisCheck)
					.always(thisCheck)
			}

			checkGrid();
			var debouncedCheckGrid = _.debounce(checkGrid, 200)
			$(window).on("resize", debouncedCheckGrid);
			thisEl.data("ignitewall-destroy", function(){
				$(window).off("resize", debouncedCheckGrid);
				thisEl.removeData("ignitewall");
				thisEl.removeData("ignitewall-destroy");
				thisEl.find(".plus-symbol").remove();
				items.css({
					"display": "",
					"width": ""
				})
			})
		})
	}

	$(document).on("ready contentLoad", function(e){
		return igniteWall($(e.target).find(".ignitewall"));
	});
	
	$.fn.ignitewall = function(options){
		return igniteWall(this, options);
	}
	$.fn.ignitewallDestroy = function(){
        var fn = $(this).data("ignitewall-destroy");
        if(fn)
            fn();
    }
})(jQuery)