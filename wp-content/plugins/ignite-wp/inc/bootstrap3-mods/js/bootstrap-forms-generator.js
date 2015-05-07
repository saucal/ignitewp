(function($){
	$.igniteForm = function(options){
		options = $.extend(true, {
			fields: {},
			labelWidth: 2,
			id: "igniteForm",
			validateForm: false
		}, options);

		var form = newElem("form", "form-horizontal", {
			role: "form",
			id: options.id
		});

		var getFieldInput = function(id, field, validateUnit){
			if(typeof validateUnit == "undefined") 
				validateUnit = true;

			var fieldInput = $();
			if(field.type == "text" || field.type == "password"){
				fieldInput = newElem("input", "form-control", {
					"id": options.id+"_"+id,
					"name": id,
					"placeholder": field.placeholder,
					"type": field.type,
					"value": field.value
				});
			} else if(field.type == "hidden"){
				fieldInput = newElem("input", "", {
					"id": options.id+"_"+id,
					"name": id,
					"type": field.type,
					"value": field.value
				});
			} else if(field.type == "textarea") {
				fieldInput = newElem("textarea", "form-control", {
					"id": options.id+"_"+id,
					"name": id,
					"placeholder": field.placeholder,
					"rows": "3"
				});
				if(!!field.value){
					fieldInput.html(field.value);
				}
			} else if(field.type == "button") {
				fieldInput = newElem("button", "btn btn-primary", {
					"id": options.id+"_"+id,
				});
				if(!!field.value){
					fieldInput.html(field.value);
				}
			} else if(field.type == "checkbox") {

				var checkInput = newElem("input", {
											"type": field.type,
											"value": field.value || "1",
											"name": id
										});

				if(field.value == true) {
					checkInput.prop("checked", true);
					checkInput.attr("checked", "");
				}

				fieldInput = newDiv("checkbox")
								.append(
									newElem("label")
										.append(checkInput)
										.append(field.title)
								);

			} else if(field.type == "text-group") {

				var inputs = $();

				$.each(field.group, function(_id, textInp){
					textInp = $.extend(true, {
						"type": "text"
					}, textInp);
						

					var thisInp = getFieldInput(id+"_"+_id, textInp, false);
					if(typeof textInp.width !== "undefined"){
						thisInp.width(textInp.width);
						thisInp = thisInp.wrap(newDiv("text-group-fixed")).parent();
					}
					inputs = inputs.add(thisInp);
				})

				fieldInput = newDiv("text-group")
								.append(inputs);

			} else if(field.type == "checkgroup") {
				fieldInput = $();
				$.each(field.group, function(i, text){
					var thisField = getFieldInput(id+"[]", {
						type: "checkbox",
						title: text,
						value: i
					}, false);
					fieldInput = fieldInput.add(thisField);
					if(field.values.indexOf(i) !== -1){
						thisField.find("input").prop("checked", true);
						thisField.find("input").attr("checked", "");
					}
				});
				fieldInput = newDiv("checkgroup").append(fieldInput);
			} else if(field.type == "select") {
				fieldInput = newElem("select", "form-control", {
					name: id 
				});
				var valueToCheck = field["value"];
				$.each(field.group, function(i, text){
					var opt = newElem("option", {
						value: i,
					}).text(text).appendTo(fieldInput);
					if(i === valueToCheck) {
						opt.attr("selected", "selected");
					}
				});
			}

			if(validateUnit == true){
				console.log(id, validateUnit);
				fieldInput.addClass("validate-unit");
				if(field.required)
					fieldInput.attr("data-required", field.required).data("required", field.required);

				if(field.validate)
					fieldInput.attr("data-validate", field.validate).data("validate", field.validate);
			}
			
			return fieldInput;
		}

		$.each(options.fields, function(id, field) {
			field = $.extend(true, {
				type: "text",
				placeholder: undefined,
				"class": "",
				title: "Field",
				value: undefined,
				noLabel: false,
				"required": false,
				"validate": false,
				"note": false
			}, field);
			

			if(field.type == "hidden"){
				var fieldInput = getFieldInput(id, field);
				fieldInput.appendTo(form);
			} else {
				var fieldElem = newDiv("form-group "+field.class).appendTo(form);
				if(!field.noLabel){
					var label = newElem("label", "col-sm-"+options.labelWidth+" control-label", {
						"for": options.id+"_"+id
					}).html(field.title).appendTo(fieldElem);
				}
				

				var fieldContainer = newDiv("col-sm-"+(12-options.labelWidth)+" "+options.id+"_"+id+"_cont"+(field.noLabel ? " col-sm-offset-"+options.labelWidth : "")).appendTo(fieldElem);
				var fieldInput = getFieldInput(id, field);
				fieldInput.appendTo(fieldContainer);

				if(field.note)
					var noteMsg = newDiv("help-block").html(field.note).appendTo(fieldContainer);			

				var note = newDiv("help-block note").hide().appendTo(fieldContainer);
			}
		});

		form.data("validated", true);
		if(options.validateForm){
			form.on("submit", function(e){
				if(!form.validateForm()){
					e.stopImmediatePropagation();
					e.stopPropagation();
					e.preventDefault();
					form.data("validated", false);
				} else {
					form.data("validated", true);
				}
			});
		}

		return form;
	}


	$.fn.clearForm = function(){
		$(this).find(".form-group").removeClass('has-error').removeClass('has-success');
		$(this).find(".help-block:visible").slideUp(200);
	}

	$.fn.findField = function(name, clear, message){
		if(typeof clear == "string"){
			message = clear;
			clear = true;
		}

		var field = $(this).find("[name='"+name+"']").first();
		var grandParent = field.parents(".form-group").first();
		var parent = field.parent();
		var note = grandParent.find(".help-block");
		if(note.length == 0)
			note = newElem("span", "help-block").hide().appendTo(parent);

		if(clear === true){
			grandParent.removeClass('has-success').removeClass('has-error');
			note.html("").filter(":visible").slideUp(200);
		}
		if(typeof message !== "undefined"){
			grandParent.addClass('has-error');
			note.html(message).slideDown(200);
		}
		return field;
	}

	$.fn.validateForm = function(){
		var thisForm = $(this);
		var ret = true;
		thisForm.find(".validate-unit").not("button, input[type='submit'], input[type='image']").each(function(){
			var input = $(this);
			var grandParent = input.parents(".form-group").first();
			var parent = input.parent();
			var note = grandParent.find(".help-block");
			if(note.length == 0)
				note = newElem("p", "help-block").hide().appendTo(parent);
			
			grandParent.removeClass('has-success').removeClass('has-error');
			note.html("").filter(":visible").slideUp(200);

			var thisVal = input.val();
			var thisValid = true;

			if(typeof input.data("required") != "undefined"){
				var filled = true;
				if(input.is("[type='checkbox']") && input.prop("checked") != true){
					filled = false
				} else if(input.is(".checkgroup")) {
					if(input.find("[type='checkbox']:checked").length == 0){
						filled = false;
					}
				} else if(input.is(".text-group")) {
					if(input.find("[type='text']").filter(function(){
						return $(this).val().length > 0;
					}).length != input.find("[type='text']").length){
						filled = false;
					}
				} else if (thisVal.length == 0) {
					filled = false
				}

				if(!filled){
					thisValid = false;
				} 
			} 
			if(typeof input.data("validate") != "undefined") {
				var validate = input.data("validate");
				var vParts = validate.split("/");
				validate = new RegExp(vParts[1],vParts[2]);

				if(!validate.test(thisVal)){
					thisValid = false;
				} 
			}
			if(thisValid){
				grandParent.addClass('has-success');
			} else {
				ret = false;
				grandParent.addClass('has-error');
			}
		});
		return ret;
	}
})(jQuery);