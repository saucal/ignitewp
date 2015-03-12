(function($){
	window.disqus_configs = {};
	window.current_disqus_config;

	window.addDisqusConfig = function(id, config){
		if(typeof disqus_configs[id] == "undefined"){
			config = $.extend(true, {
				url: disqusGlobalConfig.default_url+id,
				identifier: id,
				title: ""
			}, config);
			
			disqus_configs[id] = {
		        page: {
		            url: config.url,
		            identifier: config.identifier,
		            title: config.title
		        }
		    }
		} 
		return id;
	}
	window.initializeDisqusComments = function(){
		if(typeof window.current_disqus_config != "undefined"){
			var lazyLoadForThread = $('.lazy-load-disqus a').filter(function(){
				return $(this).data("thread-id") == window.current_disqus_config;
			});
			if(lazyLoadForThread.length == 0){
				loadComments(window.current_disqus_config);
			}
		}
	}
	window.findThreadElement = function(thread_ID, clear){
		if(typeof clear == "undefined"){
			clear = true;
		}
		return $(".disqus_thread").filter(function(){
            if(clear)
            	$(this).html("");
            return $(this).data("thread-id") == thread_ID;
        });
	}
	window.loadComments = function(thread_ID){

        var def = $.Deferred();

        var thread = findThreadElement(thread_ID).prop("id", "disqus_thread");

        $(".disqus_thread").not(thread).each(function(){
            $(this).prop("id", "disqus_thread_"+$(this).data("thread-id"));
            $(this).siblings('.lazy-load-disqus').show();
        })

        var disqusInit = function () {  
            var config = disqus_configs[thread_ID];
            this.page = $.extend(this.page, config.page);
            this.page.shortname = disqusGlobalConfig.shortname;
            this.language = disqusGlobalConfig.language;
            this.callbacks.preData = [];
            this.callbacks.preData.push(function() {
                // clear out the container (its filled for SEO/legacy purposes)
                document.getElementById("disqus_thread").innerHTML = '';
            });

            var manual_sync = function(post_id) {
            	return function(){
            		// sync comments in the background so we don't block the page
		            var script = document.createElement('script');
		            script.async = true;
		            script.src = '?cf_action=sync_comments&post_id='+post_id;

		            var firstScript = document.getElementsByTagName( "script" )[0];
		            firstScript.parentNode.insertBefore(script, firstScript);
            	}
	        }
            if (disqusGlobalConfig.perform_automatic_sync && typeof config.wp_post_id != "undefined") {
            	this.callbacks.onReady.push(manual_sync(config.wp_post_id));
            }
            this.callbacks.onReady.push(function(){
            	$(document.getElementById("disqus_thread")).trigger("disqus-rendered");
                def.resolve();
            })
            if(config.sso){
                this.sso = config.sso;
            }
        };

        loadDisqusScript();

        if(window.DISQUS === undefined){
            window.disqus_config = disqusInit;
        } else {
            DISQUS.reset({
              reload: true,
              config: disqusInit
            });
        }
        return def.promise();
    }
    window.unloadComments = function(thread_ID){
        var thread = $(".disqus_thread").filter(function(){
            $(this).html("");
            return $(this).data("thread-id") == thread_ID;
        }).prop("id", "disqus_thread");
        //console.log(thread);

        $(".disqus_thread").not(thread).each(function(){
            $(this).prop("id", "disqus_thread_"+$(this).data("thread-id"));
        });

        $(".lazy-load-disqus a").filter(function(){
            return $(this).data("thread-id") == thread_ID;
        }).parents(".lazy-load-disqus").show();
    }
    window.loadDisqusScript = function(){
    	var dsq = document.getElementById("disqus_script");
	    if(dsq){
	        //loadComments()
	    } else {
	        dsq = document.createElement('script'); 
	        dsq.type = 'text/javascript';
	        dsq.async = true;
	        dsq.id = "disqus_script"
	        dsq.src = '//' + disqusGlobalConfig.disqus_script_url;
	        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
	    }
    }
    $.fn.performDisqusLazyLoad = function(){
        var link = $(this);
        link.addClass("disabled");
        var thread_ID = link.data("thread-id");
        var thread = findThreadElement(thread_ID);
        
        thread.trigger("disqus-lazy-load-start", [link]);
        thread.one("disqus-rendered", function(){
        	link.removeClass('disabled');
        	link.parent().hide();
        });

        loadComments(thread_ID);
    };
    $(document).on("click", ".lazy-load-disqus a", function(e){
        e.preventDefault();
        $(this).performDisqusLazyLoad();
    });
})(jQuery)