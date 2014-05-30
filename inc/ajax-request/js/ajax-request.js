(function($){
	window.ajaxPost = function(action, _data, callback){
		if ( typeof _data !== "string" ) {
			_data = jQuery.param( _data, false );
		}
		return jQuery.ajax(ajax_url, {
			data: "action="+action+"&"+_data,
			method: "POST",
			complete: function(jqXHR){
				var json;
				try{
					json = $.parseJSON(jqXHR.responseText);
				} catch (e) {
					json = jqXHR.responseText;
				}
				callback.call(this, jqXHR.responseText, json);
			}
		})
	}
})(jQuery)