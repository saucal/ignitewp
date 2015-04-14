(function($){
	$.getAverageColor = function(image){
		// Create the canvas and context
		var can = document.createElement('canvas');
		var ctx = can.getContext('2d');

		// Set the canvas dimensions
		$(can).attr('width', image.width);
		$(can).attr('height', image.height);

		// Draw the image to the canvas
		ctx.drawImage(image, 0, 0, image.width, image.height);

		// Get the image data
		var image_data = ctx.getImageData(0, 0,  image.width, image.height);
		var image_data_array = image_data.data;
		var image_data_array_length = image_data_array.length;

		// Array to hold the average totals
		var a=[0,0,0];

		// Accumulate the pixel colours
		for (var i = 0; i < image_data_array_length; i += 4){
			a[0]+=image_data_array[i];
			a[1]+=image_data_array[i+1];
			a[2]+=image_data_array[i+2];
			///console.log(image_data_array[i],image_data_array[i+1],image_data_array[i+2],image_data_array[i+3]);
		}

		// Divide by number total pixels
		a[0] = Math.round(a[0]/=(image_data_array_length/4)); // R
		a[1] = Math.round(a[1]/=(image_data_array_length/4)); // G
		a[2] = Math.round(a[2]/=(image_data_array_length/4)); // B
		
		return $.RGBArrayToHEX(a);
		//return a;
	}

	$.RGBArrayToHEX = function(a) {
		function str_pad (input, pad_length, pad_string, pad_type) {
			// http://kevin.vanzonneveld.net
			// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			// + namespaced by: Michael White (http://getsprink.com)
			// +      input by: Marco van Oort
			// +   bugfixed by: Brett Zamir (http://brett-zamir.me)
			// *     example 1: str_pad('Kevin van Zonneveld', 30, '-=', 'STR_PAD_LEFT');
			// *     returns 1: '-=-=-=-=-=-Kevin van Zonneveld'
			// *     example 2: str_pad('Kevin van Zonneveld', 30, '-', 'STR_PAD_BOTH');
			// *     returns 2: '------Kevin van Zonneveld-----'
			var half = '',
			pad_to_go;

			var str_pad_repeater = function (s, len) {
				var collect = '',
				i;

				while (collect.length < len) {
					collect += s;
				}
				collect = collect.substr(0, len);

				return collect;
			};

			input += '';
			pad_string = pad_string !== undefined ? pad_string : ' ';

			if (pad_type !== 'STR_PAD_LEFT' && pad_type !== 'STR_PAD_RIGHT' && pad_type !== 'STR_PAD_BOTH') {
				pad_type = 'STR_PAD_RIGHT';
			}
			if ((pad_to_go = pad_length - input.length) > 0) {
				if (pad_type === 'STR_PAD_LEFT') {
					input = str_pad_repeater(pad_string, pad_to_go) + input;
				} else if (pad_type === 'STR_PAD_RIGHT') {
					input = input + str_pad_repeater(pad_string, pad_to_go);
				} else if (pad_type === 'STR_PAD_BOTH') {
					half = str_pad_repeater(pad_string, Math.ceil(pad_to_go / 2));
					input = half + input + half;
					input = input.substr(0, pad_length);
				}
			}

			return input;
		}
		a[0] = a[0].toString(16); // R
		a[1] = a[1].toString(16); // G
		a[2] = a[2].toString(16); // B

		a[0] = str_pad(a[0], 2, "0", "STR_PAD_LEFT"); // R
		a[1] = str_pad(a[1], 2, "0", "STR_PAD_LEFT"); // G
		a[2] = str_pad(a[2], 2, "0", "STR_PAD_LEFT"); // B

		return "#" + a.join("");
	}

	$.getContrast = function(hexcolor, light, dark, threeshold){
		if(light === undefined) light = "#FFFFFF";
		if(dark === undefined) dark = "#000000";

		if(threeshold === undefined) threeshold = 50;
		if(!(threeshold > 0 && threeshold < 1)) threeshold = threeshold / 100;
		if(hexcolor.indexOf("#") !== -1) hexcolor = hexcolor.replace("#", "");
		if(hexcolor.length === 3) hexcolor = hexcolor.substr(0,1) + hexcolor.substr(0,1) + hexcolor.substr(1,1) + hexcolor.substr(1,1) + hexcolor.substr(2,1) + hexcolor.substr(2,1);
		var r = parseInt(hexcolor.substr(0,2),16);
		var g = parseInt(hexcolor.substr(2,2),16);
		var b = parseInt(hexcolor.substr(4,2),16);
		var yiq = ((r*299)+(g*587)+(b*114))/1000;
		return (yiq >= parseInt(255 * threeshold, 10)) ? dark : light;
	}

	$.mjtTooltip = function(options){

		options = $.extend({
			icon: false,
			contents: "",
			title: false,
			buttons: {},
			closeUponDone: false
		}, options);


		var thisDef = new $.Deferred();
		var widgetBigArea = $("<div class='notification'></div>").css({
			position: "fixed",
			top: $("html").css("padding-top"),
			left: "0px",
			right: "0px",
			bottom: "0px",
			zIndex: 136797,
			background: "rgba(0,0,0,0.85)",
			fontFamily: '"Open Sans", sans-serif'
		}).appendTo("body").hide().fadeIn(200, function(){
			var widgetPosition = $("<table cellspacing='0' cellpadding='0' border='0'></table>").css({
				width: "100%",
				height: "100%"
			}).appendTo(widgetBigArea).hide().fadeIn(200);
			/*var widgetPosition = $("<div class='notificationPosition'></div>").css({
				position: "absolute",
				top: "50%",
				left: "50%"
			}).appendTo(widgetBigArea).hide().fadeIn(200);*/
			var widgetContainer = $("<tr><td class='notificationBoundary'></td></tr>").appendTo(widgetPosition);

			widgetContainer = widgetContainer.find("td").css({
				position: "relative",
				verticalAlign: "middle",
				padding: "0px 40px",
				textAlign: "center"
			});
			
			var widget = $("<div class='notificationArea clearfix'></div>").css({
				position: "relative",
				/*top: "-50%",
				left: "-50%",
				"-webkit-transform": "translateY(-50%)",
				"-moz-transform": "translateY(-50%)",
				"transform": "translateY(-50%)",*/
				background: "#FFFFFF",
				padding: "10px 20px",
				maxWidth: "700px",
				display: "inline-block"
			}).appendTo(widgetContainer);


			var _fontSize;
			if($(window).width() >= 480){
				_fontSize = 150;
			} else {
				_fontSize = 100;
			}
			widget.css({
				fontSize: _fontSize+"px"
			});


			var close = $("<a class='closeWidget'><i class='icon-remove'></i></div>").appendTo(widget).css({
				position: "absolute",
				top: "-16px",
				right: "-16px",
				"border-radius": "100px",
				fontSize: "25px",
				lineHeight: "30px",
				width: "32px",
				height: "32px",
				textAlign: "center",
				color: "#FFF",
				background: "#F71A23",
				cursor: "pointer"
			}).on("click", function(){
				thisDef.reject();
			});

			var contentArea = $("<div class='contentArea clearfix'></div>").appendTo(widget)

			if(typeof options.icon == "string"){
				var icon = $("<div class='widget_icon'>"+options.icon+"</div>").css({
					//lineHeight: (_fontSize*0.92)+"px",
					width: "0.92em",
					height: "0.92em",
					//paddingTop: (_fontSize*0.15)+"px",
					textAlign: "center",
					color: "#ED1B24",
					"float": "left"
				}).appendTo(contentArea).find("i").css({
					lineHeight: "0.92em",
					fontSize: "0.92em",
					height: "0.92em",
					verticalAlign: "top"
				});
			}
			


			var contentProp = {
				fontSize: "0.17em",
				lineHeight: "normal",
				padding: "0px 15px"
			};
			if(typeof options.icon == "string"){
				contentProp.marginLeft = (_fontSize*0.92);
			}
			var contents = $("<div class='widgetContents'></div>").css(contentProp)
				.appendTo(contentArea);

			if(options.title !== false){
				var titleArea = $("<div class='widgetTitle'>").append(options.title).css({
					fontSize: "0.17em",
					textAlign: "center",
					marginBottom: "15px",
					marginTop: "0px",
					lineHeight: "normal",
					fontWeight: "800"
				}).appendTo(contents);
			}

			contents.append(options.contents);

			if(Object.keys(options.buttons).length > 0){
				var buttons = $("<div class='buttonsContainer'></div>").css({
					fontSize: "0.15em",
					marginTop: "15px",
					textAlign: "center",
					clear: "both"
				}).appendTo(widget);


				$.each(options.buttons, function(id, buttonInfo){
					buttonInfo.css = $.extend({
						display: "inline-block",
						lineHeight: "normal"
					}, buttonInfo.css);
					var button = $("<a>"+buttonInfo.text+"</a>").css(buttonInfo.css).on("click", function(){
						buttonInfo.callback.call(thisDef);
					}).appendTo(buttons);
				});
				buttons.find("a").consistentWidth();
			}
			var heightDiff = contentArea.height() - contents.outerHeight();
			console.log(contentArea.height(), contents.outerHeight());
			if(heightDiff > 0){
				var margin = heightDiff / 2;
				contents.css({
					marginTop: margin,
					marginBottom: margin
				});
			};
		}).click(function(e){
			if($(e.target).parents().filter(".notificationBoundary").length == 0){
				thisDef.reject();
			}
		});

		thisDef.fail(function(){
			widgetBigArea.fadeOut(200, function(){
				widgetBigArea.remove();
			});
		})

		if(options.closeUponDone){
			thisDef.done(function(){
				widgetBigArea.fadeOut(200, function(){
					widgetBigArea.remove();
				});
			});
		}

		return thisDef;
	}
	$.fn.restorePrev = function(properties, time) {
		if(typeof time === "undefined") time = 500;
		return $(this).each(function(){
			var thisIsIt = $(this);
			var animateTo = {};
			var emptyVals = {};
			var originals = {};
			$.each(properties, function(i, prop){
				originals[prop] = thisIsIt.css(prop)+"";
				thisIsIt.css(prop, "");
				animateTo[prop] = thisIsIt.css(prop)+"";
				emptyVals[prop] = "";
				//console.log(prop, animateTo[prop]);
				//thisIsIt.css(prop, prev);
			})
			//console.log(animateTo);
			thisIsIt.css(originals);
			//console.log(animateTo);
			thisIsIt.animate(animateTo, time, function(){
				$(thisIsIt).css(emptyVals);
			})
		})
	}

	$.fn.animatedRemove = function(callback){
		if(callback === undefined) callback = function() {};
		return $(this).each(function(i, elem){
			$(elem).animate({
				opacity: 0,
				height: "0px",
				marginTop: "0px",
				marginBottom: "0px",
				paddingTop: "0px",
				paddingBottom: "0px"
			}, 200, function(){
				callback.call(elem);
				$(elem).remove();
			})
		})
	};
	$.fn.animatedAppend = function(_appendTo, callback){
		if(callback === undefined) callback = function() {};
		return $(this).each(function(i, elem){
			var jQElem = $(elem);
			$(_appendTo).append(jQElem);

			var targetHeight = jQElem.height();
			var targetmarginTop = jQElem.css("margin-top");
			var targetmarginBottom = jQElem.css("margin-bottom");
			var targetpaddingTop = jQElem.css("padding-top");
			var targetpaddingBottom = jQElem.css("padding-bottom");

			jQElem.height(0).css("opacity", 0).animate({
				opacity: 1,
				height: targetHeight+"px",
				marginTop: targetmarginTop,
				marginBottom: targetmarginBottom,
				paddingTop: targetpaddingTop,
				paddingBottom: targetpaddingBottom
			}, 200, function(){
				callback.call(elem);
				jQElem.css({
					opacity: "",
					height: "",
					marginTop: "",
					marginBottom: "",
					paddingTop: "",
					paddingBottom: ""
				})
			})
		});
	};
	$.fn.onImagesReady = function(callback){
		var thisIsIt = this;
		var imgs = $(thisIsIt).find("img");
		var ret = $(thisIsIt);
		if(imgs.length > 0) {
			imgs.onImageReady(callback);
		} else {
			setTimeout(callback, 0);
		}
		return ret;
	}
	$.fn.onImageReady = function(callback){
		var elems = 0;
		var thisIsIt = this;

		var _thisIsIt = $(thisIsIt).filter("img");
		elems = _thisIsIt.length;
		if(elems === 0) {
			callback.call(thisIsIt);
		}
		$(_thisIsIt).each(function(){
			$(this).one('load', function() {
				elems--;
				if(elems === 0)	{
					var _this = this;
					setTimeout(function(){
						callback.call(thisIsIt)
					}, 100);
				}
			}).one("error", function(){
				$(this).load();
			}).each(function(){
				if(this.complete) $(this).load();
			});
		})
		return $(thisIsIt);
	}
	$.fn.onElemReady = function(callback){
		var thisIsIt = this;
		/*var elems = thisIsIt.length;

		if($(thisIsIt).length === 0) callback.call(thisIsIt);
		return $(thisIsIt).each(function(){
			var	thisEl = $(this)
			if(thisEl.is("img")){
				thisEl.onImageReady(function(){
					elems--;
					if(elems === 0)	callback.call(thisIsIt)
				})
			} else {
				elems--;
				if(elems === 0)	callback.call(thisIsIt)
			}
		})*/
		return $(thisIsIt).onImageReady(callback);
	}
	$.onElementResizeClass = function(){
		this.elemsToCheck = [];
		this.timer = undefined;
	}
	$.onElementResizeClass.prototype.init = function(){
		var thisRef = this;
		thisRef.realCheckResize = _.debounce(thisRef.checkResize, 10);
		this.resetInterval();
		$(window).bind('resize', function(){
			thisRef.realCheckResize();
		});
	}
	$.onElementResizeClass.prototype.add = function(element, callback, hard){
		var $element = $(element);
		var thisRef = this;
		this.elemsToCheck.push({
			element: element,
			$element: $element,
			callbacks: [callback],
			width: $(element).width(),
			height: $(element).height(),
			hard: hard || false
		})
		if(typeof this.timer === "undefined") {
			this.init();
		}
		$element.on("elemResize", function(e, hard){
			if(hard){
				thisRef.checkResize();
			} else {
				thisRef.realCheckResize();
			}
		})
	}
	$.onElementResizeClass.prototype.resetInterval = function(time){
		if(typeof time === "undefined") time = 50;
		var thisRef = $.onElementResize;
		clearTimeout(thisRef.timer);
		thisRef.timer = undefined;
		thisRef.timer = setTimeout(function(){
			thisRef.realCheckResize(true);
		}, time);
	}
	$.onElementResizeClass.prototype.checkResize = function(hard) {
		var thisRef = this;
		$.each(this.elemsToCheck, function(i, item){
			if(hard && !item.hard)
				return;

			var thisIsIt = item.element;
			var thisIsThat = item.$element;

			if(thisIsIt !== window) {
				item.cssOldWidth = thisIsThat.get(0).style.width;
				item.cssOldHeight = thisIsThat.get(0).style.height;
			}

			thisIsThat.css({
				width: "",
				height: ""
			});
		});
		$.each(this.elemsToCheck, function(i, item){
			if(hard && !item.hard)
				return;

			var thisIsIt = item.element;
			var thisIsThat = item.$element;
			if(thisIsIt === window || thisIsThat.css("display") !== "none"){
				if(thisIsIt == window){
					item.widthn = thisIsThat.width(),
					item.heightn = thisIsThat.height();
				} else {
					item.widthn = thisIsThat.get(0).offsetWidth,
					item.heightn = thisIsThat.get(0).offsetHeight;
				}
			} else {
				item.widthn = false;
				item.heightn = false;
			}
		});
		var cbs = [];
		$.each(this.elemsToCheck, function(i, item){
			if(hard && !item.hard)
				return;
			
			var thisIsIt = item.element;
			var thisIsThat = item.$element;
			var callbacks = item.callbacks;

			if(item.widthn != false){
				//console.log(width, " ", widthn, " | ", height, " ", heightn);
				if(item.width != item.widthn || item.height != item.heightn){
					thisRef.elemsToCheck[i].width = item.widthn;
					thisRef.elemsToCheck[i].height = item.heightn;
					$.each(callbacks, function(i, callback){
						cbs.push({f: callback, e: thisIsIt});
					});
				} else {
					thisIsThat.css({
						width: item.cssOldWidth,
						height: item.cssOldHeight
					})
				}
				delete item.widthn;
				delete item.heightn;
			}
		})
		$.each(cbs, function(i, cb){
			cb.f.call(cb.e);
		});
		this.resetInterval();
	}
	$.onElementResize = new $.onElementResizeClass();
	$.fn.onElementResize = function(callback, execInitial){
		if(execInitial === undefined) execInitial = false;
		return $(this).each(function(){
			$.onElementResize.add(this, callback)			
			if(execInitial){
				callback.call(this)
			}
		})
	}
	$.fn.fluidImg = function( _opts ){
		if(_opts === undefined) _opts = {};
		var opts = $.extend(true, {
			container: {
				width: "auto",
				height: "auto"
			},
			overflow: false
		}, _opts);

		return $(this).each(function(){
			var thisEl = $(this);
			if(!thisEl.is("img")) return;
			thisEl.onImageReady(function(){
				var thisIsIt = this;
				var fit = function(){
					$(thisIsIt).css({
						width: "100%",
						height: "auto"
					})
					var width = $(thisIsIt).width();
					var height = $(thisIsIt).height();
					var offset;
					if(width > height){
						offset = width-height;
						$(thisIsIt).css({
							marginTop: (offset/2)+"px",
							marginBottom: (offset/2)+"px"
						})
					} else if(height > width){
						$(thisIsIt).css({
							width: "auto",
							height: width+"px"
						})
						width = $(thisIsIt).width();
						height = $(thisIsIt).height();
						offset = height-width;
						$(thisIsIt).css({
							marginLeft: (offset/2)+"px"
						})
					}
				};
				$(window).bind("resize", fit);
				fit.call(thisIsIt);
			})
		})
	}
	$.fn.getFiller = function(filler_class){
		var filler;
		if(typeof filler_class === "string") {
			filler = $(this).find(filler_class);
		} else {
			filler = $(this);
		}
		return filler;
	}
	$.fn.consistentHeight = function(filler_class, offset){
		if(offset === undefined) offset = 0;
		if(filler_class === undefined) filler_class = false;
		var thisIsIt = this;
		var adjust = function(){
			var maxHeight = 0;
			$(thisIsIt).each(function(){
				var thisEl = $(this);
				var height = thisEl.get(0).offsetHeight;
				if(height > maxHeight){
					maxHeight = height;
				}
			});
			$(thisIsIt).each(function(){
				var filler = $(this).getFiller(filler_class);
				filler.css("height", maxHeight);
			});
		}
		$(thisIsIt).onElementResize(adjust, true)
	}
	$.fn.consistentWidth = function(filler_class, offset){
		if(offset === undefined) offset = 0;
		if(filler_class === undefined) filler_class = false;
		var thisIsIt = this;
		var adjust = function(){
			var maxWidth = 0;
			$(thisIsIt).each(function(){
				var thisEl = $(this);
				var width = thisEl.get(0).offsetWidth;
				if(width > maxWidth){
					maxWidth = width;
				}
			})
			$(thisIsIt).each(function(){
				var filler = $(this).getFiller(filler_class);
				filler.css("width", maxWidth);
			});
		}
		$(thisIsIt).onElementResize(adjust, true);
	}
	$.fn.hoverFaded = function(){
		var thisIsIt = this;
		adjust = function(){
			var maxHeight = 0;
			$(thisIsIt).each(function(){
				var thisEl = $(this);
				thisEl.css("height", "");
				var height = thisEl.height();
				if(height > maxHeight){
					maxHeight = height;
				}
			})
			$(thisIsIt).height(maxHeight);
		}
		$(thisIsIt).onElementResize(adjust)
		adjust.call(thisIsIt);
	}
	$.fn.fillParent = function(options){
		if(options === undefined) options = {};
		options = $.extend(true, {
			hideImg: false
		}, options);
		var thisIsIt = this;
		$(thisIsIt).each(function(){
			var thisEl = $(this);
			var parent = thisEl.parent();
			parent.css({
				overflow: "hidden"
			})
			if(thisEl.is("img") && parent.get(0).style["backgroundSize"] !== undefined){
				if(options.hideImg === true) {
					thisEl.css({
						display: "none"
					});
				} else {
					thisEl.css({
						visibility: "hidden"
					});
				}
				parent.css({
					"background-image": "url('"+thisEl.attr("src")+"')",
					"background-position": "center center",
					"background-size": "cover"
				})
			} else {
				var adjustFunc = function(){
					if(thisEl.get(0).complete === false) return;
					thisEl.css({
						width: "100%",
						height: "auto",
						maxHeight: "none",
						maxWidth: "none"
					})
					if(parent.height() < thisEl.height()){
						var halfDiff = (thisEl.height() - parent.height()) / 2;

						//console.log(parent.height(), " - ", thisEl.height(), " = ", halfDiff , " | ", thisEl.attr("src"));
						thisEl.css({
							position: "relative",
							top: "-"+halfDiff+"px"
						})
					} else {
						thisEl.css({
							width: "auto",
							height: parent.height()
						})
						var halfDiff = (thisEl.width() - parent.width()) / 2;

						if(halfDiff == 0) return;
						//console.log(thisEl.width(), " - ", parent.width(), " = ", halfDiff , " | ", thisEl.attr("src"));
						thisEl.css({
							position: "relative",
							left: "-"+halfDiff+"px"
						})
					}
				}
				thisEl.onElemReady(adjustFunc);
				parent.onElementResize(adjustFunc);
			}
		})
	}
	$.fn.aspectRatio = function(w, h, preserve) {
		var thisIsIt = this;
		if(w === undefined) return;
		if(h === undefined) return;
		if(preserve === undefined) preserve = "width";
		adjust = function(){
			thisIsIt.each(function(){
				var thisEl = $(this);
				thisEl.onElemReady(function(){
					if(preserve == "width"){
						thisEl.height(thisEl.width() * h / w);
					} else {
						thisEl.width(thisEl.height() * h / w);
					}
				});
			});
		}
		$(thisIsIt).onElementResize(adjust);
		adjust.call(thisIsIt);
	}

	$.fn.selectRange = function(start, end) {
		if(!start) {
			var ret = {},
				t = this.get(0);
			if(typeof t.selectionStart == "undefined"){
				var selection=document.selection;
                if (this[0].tagName.toLowerCase() != "textarea") {
                    var val = this.val(),
                    range = selection["createRange"]()[duplicate]();
                    range.moveEnd("character", val[len]);
                    ret.s = (range.text == "" ? val[len]:val.lastIndexOf(range.text));
                    range = selection["createRange"]()[duplicate]();
                    range.moveStart("character", -val[len]);
                    ret.e = range.text[len];
                } else {
                    var range = selection["createRange"](),
                    stored_range = range[duplicate]();
                    stored_range.moveToElementText(this[0]);
                    stored_range.setEndPoint('EndToEnd', range);
                    ret.s = stored_range.text[len] - range.text[len],
                    ret.e = ret.s + range.text[len]
                }
            } else {
				ret.s=t.selectionStart;
				ret.e=t.selectionEnd;
			}
			return ret
		}
	    if(!end) end = start; 
	    return this.each(function() {
	        if (this.setSelectionRange) {
	            this.focus();
	            this.setSelectionRange(start, end);
	        } else if (this.createTextRange) {
	            var range = this.createTextRange();
	            range.collapse(true);
	            range.moveEnd('character', end);
	            range.moveStart('character', start);
	            range.select();
	        }
	    });
	};

	$.fn.dynamicValidator = function(classesToParent){
		return $(this).each(function(){
			var thisEl = $(this);
			var classesTo = thisEl
			if(classesToParent !== undefined){
				classesTo = thisEl.parents(classesToParent).first();
			}
			var isValid = function() {
				var isReq = (thisEl.data("required") !== undefined && thisEl.data("required") !== "");
				var hasValidation = (thisEl.data("valid") !== undefined && thisEl.data("valid") !== "");
				var isEmpty = thisEl.val().length == 0;
				if((!hasValidation && isEmpty && !isReq) || (isEmpty && !isReq)) return true;
				if(isEmpty && isReq) return false;
				if(!isEmpty && isReq && !hasValidation) return true;
				if(!isEmpty && !hasValidation) return true;
				var regex = new RegExp("^"+thisEl.data("valid")+"$", "i");
				return regex.test(thisEl.val())
			}
			var Validate = function() {
				ret = isValid();
				if(ret){
					classesTo.addClass("valid").removeClass("invalid");
				} else {
					classesTo.addClass("invalid").removeClass("valid");
				}
				return ret;
			}
			thisEl.on("change", function(){
				Validate();
			})
			thisEl.parents("form").first().on("submit", function(e){
				if(!Validate()){
					e.preventDefault();
				}
			})

		});
	}


	$.fn.dynamicInput = function(){
		return $(this).each(function(){
			var thisEl = $(this);
			var checkPos = function(e, update){
				var currenPos = $(this).selectRange();
				var dirtyVal = $(this).val();
				var cleanVal = dirtyVal;
				var pre = "";
				var pos = "";
				if($(this).data("prefiller-first")) {
					pre = $(this).data("prefiller-first");
					cleanVal = cleanVal.replace(pre, "");
				}
				if($(this).data("prefiller-last")) {
					pos = $(this).data("prefiller-last");
					cleanVal = cleanVal.replace(pos, "");
				}
				if(e.type === "keydown"){
					switch(e.which) {
						case 37: //left arrow
						case 8: //backspace
							if(currenPos.s == pre.length){
								e.preventDefault();
							}
							return
							break;
						case 39: //right arrow
						case 46: //delete
							if(currenPos.s == pre.length + cleanVal.length){
								e.preventDefault();
							}
							return;
							break;
					}
					$(this).data("prev-pos", currenPos.s);
				};
				if(currenPos.s < pre.length) {
					currenPos.s = pre.length ;
				} else if (currenPos.s > cleanVal.length + pre.length){
					currenPos.s = cleanVal.length + pre.length;
				}
				currenPos.e = currenPos.s;
				if(e.type === "keyup"){
					if($(this).data("prev-pos") !== undefined){
						if($(this).data("prev-pos") == 0){
							currenPos.e = currenPos.s = currenPos.e + 1;
						}
					}
				}
				dirtyVal = cleanVal.length > 0 ? pre + cleanVal + pos : ""
				if(update) $(this).val(dirtyVal);
				$(this).selectRange(currenPos.s, currenPos.e);
				return {
					clean: cleanVal,
					dirtyVal: dirtyVal
				}
			};
			$(thisEl).on("keyup", function(e){
				checkPos.call(this, e, true);
			});
			$(thisEl).on("select", function(e){
				checkPos.call(this, e);
			});
			$(thisEl).on("focus", function(e){
				checkPos.call(this, e);
			});
			$(thisEl).on("keydown", function(e){
				checkPos.call(this, e);
			});
		})
	}
	$.fn.customCheck = function(callback){
		if(callback === undefined) callback = function(){};
		return $(this).each(function(){
			var custom_check = $(this);
			var checkbox = $("input[name='"+custom_check.data("name")+"']");


			
			var setState = function(state, time, trigger){
				if(state === undefined) state = !checkbox.prop("checked");
				if(time === undefined) time = 500;
				if(trigger === undefined) trigger = true;
				var disable = custom_check.children(".disable").stop();
				var enable = custom_check.children(".enable").stop();
				if(state == true){
					disable.animate({
						opacity: 0
					},time);
					enable.animate({
						opacity: 1
					},time);
					checkbox.prop("checked", state);
				} else {
					disable.animate({
						opacity: 1
					},time);
					enable.animate({
						opacity: 0
					},time);
					checkbox.prop("checked", state);
				}
				custom_check.trigger("change", [checkbox]);
				if(trigger !== false) checkbox.trigger("change");
			}

			checkbox.on("change", function(){
				setState(checkbox.prop("checked"), 500, false);
				callback.call(custom_check, checkbox)
			})

			setState(checkbox.prop("checked"), 0);

			custom_check.click(function(){
				setState();
			})
		})
	}

	$.infiniteScrolling = function(opts){
		if(opts === undefined) return;

		opts = $.extend(true, {
			preAppend: function(){},
			listAdjustments: function(){},
			postsContainer: null,
			appendTo: null
		}, opts);

		var getNextPage = function(){
			var thisDef = new $.Deferred();
			var urlInfo = window.location.href.split("/").reverse();
			var newUrl;
			var pageNum = $("body").data("currentPage");
			if(pageNum === undefined) pageNum = 1;

			//console.log(pageNum, $("body").data("currentPage"));
			if(urlInfo[0] === "" && urlInfo[2] === "page"){
				pageNum = parseInt(urlInfo[1], 10);
				newUrl = urlInfo.slice(3).reverse().join("/");
			} else if(urlInfo[1] === "page") {
				pageNum = parseInt(urlInfo[0], 10);
				newUrl = urlInfo.slice(2).reverse().join("/");
			} else {
				newUrl = urlInfo.reverse().join("/");
			}
			if(newUrl.slice(-1) !== "/") newUrl += "/";
			//console.log(pageNum, newUrl);

			$.ajax({
				type: "GET",
				url: newUrl + "page/" + (pageNum+1) + "/",
				success: function(data, textStatus, jqXHR){
					//$("#branding .inner").append(data);
					$("body").data("currentPage", pageNum+1)
					thisDef.resolve($(data));
				},
				error: function(){
					thisDef.reject();
				},
				async: true
			});
			return thisDef;
		}

		var scrollCheck = function(){
			var lala = $(this).scrollTop() + $(window).height();
			//console.log(lala, $(this).height())
			if(lala >= $(this).height()){
				$(document).off("scroll", scrollCheck);
				getNextPage().done(function(nextPageData){
					nextPageData.find(".pagination").remove();
					opts.preAppendCallback.call(nextPageData);
					opts.listAdjustments(nextPageData);
					//console.log(nextPageData.find(opts.postsContainer), opts.postsContainer);
					nextPageData.find(opts.postsContainer).children().appendTo(opts.appendTo);
					$(document).on("scroll", scrollCheck);
			  		$(document).trigger("scroll");
				});
			}
		}

		if($(".pagination").length > 0){
			$(".pagination").remove();
			$(document).on("scroll", scrollCheck);
			$(document).trigger("scroll");
		}
	}


	$(function($){
		$(document).on("click", ".open_video", function(){
			$(this).addClass("playing_video");
			var id = $(this).data("video-id");
			$('<iframe width="640" height="360" src="//www.youtube-nocookie.com/embed/'+id+'?rel=0&autoplay=1" frameborder="0" allowfullscreen></iframe>').css({
				display: "block",
				width: "100%",
				height: "100%",
				position: "absolute",
				top: "0px",
				left: "0px"
			}).appendTo($(this));
		})
		$(".twitter_feed_widget").twitterFeedAdaptColums();
	});

	$.fn.twitterFeedAdaptColums = function(){
		$(this).each(function(){
			var thisFeed = $(this);
			if(thisFeed.data("checking") === true) return;
			thisFeed.data("checking", true);
			thisFeed.onElementResize(function(){
				var feedWidth = thisFeed.width();
				var columns = Math.floor(feedWidth / 380);
				thisFeed.attr("data-columns", columns);
				thisFeed.find("br.clearline").remove();
				thisFeed.find(".tweet").removeClass("first-of-line").filter(":nth-child("+columns+"n+"+(columns+1)+")").addClass("first-of-line").before("<br class='clearline' />");
			}, true);
		})
	}

	if(window.locationHandler === undefined) {
		window.locationHandler = function(url){
			window.location.href = url;
		}
	}
	
})(jQuery)