(function($){
	$.igniteTooltip = function(options){
		options = $.extend({
			contents: "",
			title: false,
			buttons: {},
			closeUponDone: false,
			id: "mapPopUp",
			submitFormsWithPrimary: false,
			icon: false
		}, options);

		var thisDef = new $.Deferred();

		var modalProps = {
			"id": options.id,
			"tabindex": "-1",
			"role": "dialog",
			"aria-hidden": "true"
		};
		if(options.title !== false){
			modalProps = $.extend(true,modalProps, {
				"aria-labelledby": options.id+"Label"
			});
		}

		var widgetBigArea = newDiv("ignite-modal ignite-fade", modalProps).appendTo("body");
		var widgetPosition = newDiv("ignite-modal-dialog").appendTo(widgetBigArea);
		var widgetContainer = newDiv("ignite-modal-content").appendTo(widgetPosition);


		var closeWidgetFunc = function(){
			widgetBigArea.modal("hide").one("hidden.bs.modal", function(){
				widgetBigArea.remove();
			})
		}

		if(options.title !== false || options.icon !== false){
			var header = newDiv("ignite-modal-header clearfix")
				.append($('<button type="button" class="close" aria-hidden="true">&times;</button>').on("click", closeWidgetFunc))
				.appendTo(widgetContainer);

			if(options.icon !== false) {
				header.append('<h4 class="ignite-modal-icon" id="'+options.id+'Icon">'+options.icon+'</h4>')
			}
			if(options.title !== false) {
				header.append('<h4 class="ignite-modal-title" id="'+options.id+'Label">'+options.title+'</h4>')
			}
		} else {
			$('<button type="button" class="close" aria-hidden="true">&times;</button>').on("click", closeWidgetFunc)
				.css({
					width: "1em",
					margin: "0.25em",
					zIndex: "1",
					position: "relative"
				})
				.appendTo(widgetContainer);
		}

		var contents = newDiv("ignite-modal-body").appendTo(widgetContainer);

		if(options.title === false && options.icon === false) {
			contents.css({
				padding: "15px 30px"
			})
		}

		contents.append(options.contents);

		if(Object.keys(options.buttons).length > 0){
			var buttons = newDiv("ignite-modal-footer").appendTo(widgetContainer);
			$.each(options.buttons, function(id, buttonInfo){
				buttonInfo = $.extend(true, {
					text: "",
					css: {},
					callback: function(){},
					"class": "btn-default"
				}, buttonInfo);
				
				var button = $("<button type='button' class='btn "+buttonInfo.class+"'>"+buttonInfo.text+"</button>").css(buttonInfo.css).on("click", function(){
					if(options.submitFormsWithPrimary && $(this).is(".btn-primary") && contents.find("form").length > 0){
						$(this).addClass('disabled');
						contents.find("form").trigger("submit");
						$(this).removeClass('disabled');
						if(!contents.find("form").data("validated"))
							return;

					}
					buttonInfo.callback.call(thisDef, button);
				}).appendTo(buttons);
			});
			if(options.submitFormsWithPrimary){
				var form = contents.find("form");
				var btns = form.find("button, input[type='submit'], input[type='image']");
				if(btns.length == 0){
					form.append(newElem("button").hide())
				}
				form.on("submit", function(e){
					if(buttons.find(".btn-primary").length == 1){
						e.preventDefault();
						if(!buttons.find(".btn-primary").hasClass('disabled'))
							buttons.find(".btn-primary").click();
					}
				});
			}
		}

		

		thisDef.fail(closeWidgetFunc)

		widgetBigArea.modal()
		widgetBigArea.on("hide.bs.modal", function(){
			if(thisDef.state("pending")){
				thisDef.reject();
			}
		})
		widgetBigArea.on("shown.bs.modal", function(){
			$("body").addClass('ignite-modal-open');
		})

		if(options.closeUponDone){
			thisDef.done(closeWidgetFunc);
		}

		return {
			promise: function(){
				return thisDef.promise();
			},
			on: function(event, delegate, callback){
				if(event == "shown")
					event = "shown.bs.modal";

				widgetBigArea.on(event, delegate, callback);
			}
		};
	}
})(jQuery);