(function($){
	$.fn.QuickSelect = function(options){
		options = $.extend(true, {
			iconUp: "&#9650;",
			iconDown: "&#9660;",
			minElemsBeforeGoingUp: 3,
			openEffect: "fadeIn",
			closeEffect: "hide"
		}, options);
		$(this).filter("select").each(function(){
			var thisElem = $(this);

			if(typeof thisElem.data("qs-initialized") !== "undefined") return;
			thisElem.data("qs-initialized", true);

			var newDiv = function(_class, divOpts){
				if(typeof _class == "object"){
					divOpts = _class;
					_class = undefined;
				}
				if(typeof _class == "undefined") _class = "";
				divOpts = $.extend(true, {
					"class": _class
				}, divOpts);
				return $("<div>", divOpts);
			}

			thisElem.hide();
			var tabAnchor = $("<a>",{"class":"qs-anchor", "href": "#"}).insertAfter(thisElem);

			var main = newDiv('qs').appendTo(tabAnchor);
			var fixed = newDiv('qs-fixed').appendTo(main);
			var dropdown = newDiv('qs-dropdown').hide().appendTo(main);

			var viewportArrow = newDiv('qs-viewport-arrow').appendTo(fixed);
			var arrow = newDiv("qs-arrow").appendTo(viewportArrow);
			var viewportContainer = newDiv("qs-viewport-container").appendTo(viewportArrow);
			var viewport = newDiv("qs-viewport").appendTo(viewportContainer);
			var shadowViewport = newDiv("qs-shadow-viewport").appendTo(viewportContainer);

			
			var adjustViewport = function(){
				viewportContainer.css({
					marginRight: arrow.outerWidth(true)+"px"
				});
			}
			adjustViewport();

			arrow.html(options.iconDown);

			var thisOptions = thisElem.children('option');


			var getText = function(option){
				var text = option.text();
				if(text.length == 0) text = "&nbsp;";
				return text;
			}
			var getSelected = function(){
				var selected = thisOptions.filter(function(){
					return $(this).prop("selected") === true;
				});
				if(selected.length === 0){
					selected = thisOptions.first().prop("selected", true);
				}
				return selected;
			}
			var setSelected = function(opt, _trigger){
				var trigger;
				if(typeof _trigger === "undefined") {
					trigger = true;
				} else {
					trigger = _trigger;
				}

				var ret = $();
				
				thisOptions.each(function(){
					if($(this).is(opt)){
						if($(this).prop("selected") === true) trigger = false;
						$(this).prop("selected", true);
						$(this).attr("selected", "");
						ret = $(this);
						$(this).data("qs-mirror").addClass('selected').siblings().removeClass('selected');
						viewport.html(getText(opt));
					} else {
						$(this).removeAttr('selected');
						$(this).prop("selected", false);
					}
				});
				
				if(trigger) thisElem.trigger("change", [true]);

				return ret;
			}
			var setHover = function(option){
				option.addClass('hover').siblings().removeClass('hover');
			}

			var getFirstOptionsHeight = function(){
				var height = 0;
				dropdown.children(".qs-option").slice( 0, options.minElemsBeforeGoingUp ).each(function(){
					height += $(this).outerHeight(true);
				});
				return height;
			}

			var heightAsManyOptionsAsPossible = function(heightAvailable){
				var height = 0;
				dropdown.children(".qs-option").each(function(){
					var thisHeight = $(this).outerHeight(true);
					if(thisHeight + height < heightAvailable){
						height += thisHeight;
					}
				});
				return height;
			}

			var checkSize = function(){
				
				var viewportHeight = $(window).height();
				var offset = main.offset();
				var scrollTop = $(window).scrollTop();
				var height = main.height();

				var spaceBelow = viewportHeight - offset.top - height + scrollTop;
				var spaceAbove = offset.top - scrollTop;

				main.removeClass('open-above');
				if(dropdown.is(":visible")){
					dropdown.css("max-height", "");
					var dropdownHeight = dropdown.outerHeight();
					if(dropdownHeight > spaceBelow) {
						var maxHeight = getFirstOptionsHeight();
						if(spaceBelow >= maxHeight || spaceBelow >= spaceAbove){
							dropdown.css("max-height", heightAsManyOptionsAsPossible(spaceBelow)+"px");
						} else if(spaceAbove > spaceBelow) {
							main.addClass('open-above');
							dropdown.css("max-height", heightAsManyOptionsAsPossible(spaceAbove)+"px");
						}
					}
				} else {
					if(150 > spaceBelow) {
						main.addClass('open-above');
					}
				}
			}

			var doDropdown = function(){
				if(dropdown.is(":visible")){
					hideDropdown();
				} else {
					tabAnchor.focus();
					setHover(getSelected().data("qs-mirror"));
					dropdown.show();
					checkSize();
					dropdown.hide();


					if(typeof options.openEffect == "function"){
						options.openEffect.call(dropdown.get(0), {
							quickSelect: main,
							original: thisElem,
							options: options
						})
					} else {
						dropdown.fadeIn(100);
					}

					main.addClass('opened');
				}
			}
			var hideDropdown = function(){
				if(typeof options.closeEffect == "function"){
					options.closeEffect.call(dropdown.get(0), {
						quickSelect: main,
						original: thisElem,
						options: options
					})
				} else {
					dropdown.hide();
				}
				main.removeClass('opened');
			}
			$(window).on("resize", function(){
				checkSize();
			});
			$(window).on("scroll", function(){
				checkSize();
			});
			fixed.on("click", function(){
				doDropdown();
			});

			//detect click outside
			$(document).on("click", function(e){
				var target = $(e.target);
				var matchingParents = target.parents().filter(function(){
					return $(this).is(main);
				}).length;
				if(!target.is(main) && matchingParents == 0){
					hideDropdown();
				}
			});

			thisOptions.each(function(){
				var thisOpt = $(this);
				var optVal = thisOpt.attr("value");
				var option = $("<div class='qs-option'>").appendTo(dropdown);
				var shadowViewportItem = $("<div class='qs-viewport'>").html(getText(thisOpt)).appendTo(shadowViewport);
				thisOpt.data("qs-mirror", option);

				option.html(getText(thisOpt));

				option.attr("data-value", optVal);
				option.data("value", optVal);

				option.on("mouseenter", function(){
					setHover($(this));
				});

				if(thisOpt.prop("selected") === true){
					setSelected(thisOpt, false);
				}

				option.on("click", function(){
					setSelected(thisOpt);
					hideDropdown();
				});
			});

			thisElem.on("change", function(e, hasToIgnore){
				if(typeof hasToIgnore !== "undefined") return;
				setSelected(getSelected());
			});


			tabAnchor.on("click", function(e){
				e.preventDefault();
			});

			tabAnchor.on("keydown", function(e){
				if(tabAnchor.is(":focus")){
					if(e.which == 38 || (!dropdown.is(":visible") && e.which == 37 )){
						e.preventDefault();
						var previous = getSelected().prev();
						if(previous.length > 0){
							setHover(setSelected(previous).data("qs-mirror"));
						}
					} else if(e.which == 40 || (!dropdown.is(":visible") && e.which == 39 )) {
						e.preventDefault();
						var next = getSelected().next();
						if(next.length > 0){
							setHover(setSelected(next).data("qs-mirror"));
						}
					} else if(e.which == 13) {
						e.preventDefault();
						doDropdown();
					} else if(e.which == 27) {
						e.preventDefault();
						hideDropdown();
					}
				}
			});


		});
		return $(this);
	}
	$(function(){
		$("select.quick-select").QuickSelect();
	})
})(jQuery);
