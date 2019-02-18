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
})(jQuery)