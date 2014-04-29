(function($){

	if(RegExp.prototype.execAll === undefined){
		// Return all pattern matches with captured groups
		RegExp.prototype.execAll = function(string) {
		    var match = null;
		    var matches = new Array();
		    while (match = this.exec(string)) {
		        var matchArray = [];
		        for (i in match) {
		            if (parseInt(i) == i) {
		                matchArray.push(match[i]);
		            }
		        }
		        matches.push(matchArray);
		    }
		    return matches;
		}
	}
	var adjustStack = function(){
		var allspans = $('[class*="span"]');
		allspans.css("margin-left", "").css("clear", "");;
		allspans.each(function(){
			var thisIsThat = $(this);
			var re = new RegExp("((?:.?))span(.{1,2}?)","g");
			var m = re.execAll(thisIsThat.attr("class"));
			$.each(m, function(i, item){
				try {
					if($(window).width() > 767) {
						if(this[1] == " " || this[1] == ""){
							if(thisIsThat.is(":nth-child("+(12/this[2])+"n+1)") && !thisIsThat.is('[class*="offset"]') && !thisIsThat.is(':first-child')){
								thisIsThat.css("margin-left", "0").css("clear", "left");
							}
						}
					} else {
						if(this[1] == "-"){
							if(thisIsThat.is(":nth-child("+(12/this[2])+"n+1)") && !thisIsThat.is('[class*="offset"]') && !thisIsThat.is(':first-child')){
								thisIsThat.css("margin-left", "0").css("clear", "left");
							}
							return;
						}
					}
				} catch (error) {
					
				}
			});
		})
	};
	$(function(){
		$(window).resize(adjustStack);
		adjustStack();
	})
})(jQuery)