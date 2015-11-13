(function($){

	function igniteWall(elems, options) {
		options = $.extend(true, {
			tolerance: 0.2,
			elementSelector: ".iw-item",
			bgParentSelector: ".iw-bg-parent"
		}, options);
		
		return $(elems).each(function(){
			var thisFreewall = $(this);
			if(thisFreewall.data("ignitewall"))
				return;

			thisFreewall.data("ignitewall", true);
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
			$(window).on("resize", _.debounce(checkGrid, 200));
		})
	}

	$(document).on("ready contentLoad", function(e){
		return igniteWall($(e.target).find(".ignitewall"));
	});
	
	$.fn.ignitewall = function(options){
		return igniteWall(this, options);
	}
})(jQuery)