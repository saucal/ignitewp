(function($){
	$.bootstrapTooltip = function(options){
		options = $.extend({
			contents: "",
			title: false,
			buttons: {},
			closeUponDone: false,
			id: "mapPopUp",
			submitFormsWithPrimary: false
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

		var widgetBigArea = newDiv("modal fade", modalProps).appendTo("body");
		var widgetPosition = newDiv("modal-dialog").appendTo(widgetBigArea);
		var widgetContainer = newDiv("modal-content").appendTo(widgetPosition);


		var closeWidgetFunc = function(){
			widgetBigArea.modal("hide").one("hidden.bs.modal", function(){
				widgetBigArea.remove();
			})
		}

		if(options.title !== false){
			newDiv("modal-header")
				.append($('<button type="button" class="close" aria-hidden="true">&times;</button>').on("click", closeWidgetFunc))
				.append('<h4 class="modal-title" id="'+options.id+'Label">'+options.title+'</h4>').appendTo(widgetContainer);
		}

		var contents = newDiv("modal-body").appendTo(widgetContainer);

		contents.append(options.contents);

		if(Object.keys(options.buttons).length > 0){
			var buttons = newDiv("modal-footer").appendTo(widgetContainer);
			$.each(options.buttons, function(id, buttonInfo){
				buttonInfo = $.extend(true, {
					text: "",
					css: {},
					callback: function(){},
					"class": "btn-default"
				}, buttonInfo);
				
				var button = $("<button type='button' class='btn "+buttonInfo.class+"'>"+buttonInfo.text+"</button>").css(buttonInfo.css).on("click", function(){
					buttonInfo.callback.call(thisDef, button);
				}).appendTo(buttons);
			});
		}

		if(options.submitFormsWithPrimary){
			var btns = contents.find("form").find("button, input[type='submit'], input[type='image']");
			if(btns.length == 0){
				contents.find("form").append(newElem("button").hide())
			}
			contents.find("form").on("submit", function(e){
				if(buttons.find(".btn-primary").length == 1){
					e.preventDefault();
					if(!buttons.find(".btn-primary").hasClass('disabled'))
						buttons.find(".btn-primary").click();
				}
			});
		}

		

		thisDef.fail(closeWidgetFunc)

		widgetBigArea.modal()
		widgetBigArea.on("hide.bs.modal", function(){
			if(thisDef.state("pending")){
				thisDef.reject();
			}
		})
		widgetBigArea.on("shown.bs.modal", function(){
			$("body").addClass('modal-open');
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