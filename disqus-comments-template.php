<?php
if (DISQUS_DEBUG) {
    echo "<p><strong>Disqus Debug</strong> thread_id: ".get_post_meta($post->ID, 'dsq_thread_id', true)."</p>";
}
?>

<div id="disqus_thread_<?php the_ID(); ?>" class="disqus_thread" data-thread-id="<?php the_ID(); ?>">
    <?php if (!get_option('disqus_disable_ssr') && have_comments()): ?>
        <?php
        // if (is_file(TEMPLATEPATH . '/comments.php')) {
        //     include(TEMPLATEPATH . '/comments.php');
        // }
        ?>
        <div id="dsq-content">

<?php if (get_comment_pages_count() > 1 && get_option('page_comments')): // Are there comments to navigate through? ?>
            <div class="navigation">
                <div class="nav-previous"><?php previous_comments_link(dsq_i( '<span class="meta-nav">&larr;</span> Older Comments')); ?></div>
                <div class="nav-next"><?php next_comments_link(dsq_i('Newer Comments <span class="meta-nav">&rarr;</span>')); ?></div>
            </div> <!-- .navigation -->
<?php endif; // check for comment navigation ?>

            <ul id="dsq-comments">
                <?php
                    /* Loop through and list the comments. Tell wp_list_comments()
                     * to use dsq_comment() to format the comments.
                     */
                    wp_list_comments(array('callback' => 'dsq_comment'));
                ?>
            </ul>

<?php if (get_comment_pages_count() > 1 && get_option('page_comments')): // Are there comments to navigate through? ?>
            <div class="navigation">
                <div class="nav-previous"><?php previous_comments_link(dsq_i( '<span class="meta-nav">&larr;</span> Older Comments')); ?></div>
                <div class="nav-next"><?php next_comments_link(dsq_i( 'Newer Comments <span class="meta-nav">&rarr;</span>')); ?></div>
            </div><!-- .navigation -->
<?php endif; // check for comment navigation ?>

        </div>

    <?php endif; ?>
</div>

<div class="lazy-load-disqus" style="text-align: center;"><a href="#" class="call-to-action" data-thread-id="<?php the_ID(); ?>">Load Comments</a></div>

<script type="text/javascript">
/* <![CDATA[ */

    if(window.disqus_configs === undefined){
        window.disqus_configs = {};
        window.current_disqus_config;
    }
    disqus_configs["post_<?php the_ID(); ?>"] = {
        page: {
            url: '<?php echo get_permalink(); ?>',
            identifier: '<?php echo dsq_identifier_for_post($post); ?>',
            shortname: '<?php echo strtolower(get_option('disqus_forum_url')); ?>',
            title: <?php echo cf_json_encode(dsq_title_for_post($post)); ?>
        },
        language: '<?php echo esc_js(apply_filters('disqus_language_filter', '')) ?>',
        manual_sync: function() {
            // sync comments in the background so we don't block the page
            var script = document.createElement('script');
            script.async = true;
            script.src = '?cf_action=sync_comments&post_id=<?php echo $post->ID; ?>';

            var firstScript = document.getElementsByTagName( "script" )[0];
            firstScript.parentNode.insertBefore(script, firstScript);
        }
    }
    <?php
    $sso = dsq_sso();
    if ($sso) {
        foreach ($sso as $k=>$v) {
            echo "disqus_configs[\"post_<?php the_ID(); ?>\"].page.{$k} = '{$v}';\n";
        }
        echo "disqus_configs[\"post_<?php the_ID(); ?>\"].".dsq_sso_login();
    }
    ?>
    if(window.current_disqus_config === undefined){
        current_disqus_config = disqus_configs["post_<?php the_ID(); ?>"];
    }

    if(window.loadComments === undefined){
        window.loadComments = function(post_ID){
            (function($){
                var thread = $(".disqus_thread").filter(function(){
                    $(this).html("");
                    return $(this).data("thread-id") == post_ID;
                }).prop("id", "disqus_thread");
                //console.log(thread);

                $(".disqus_thread").not(thread).each(function(){
                    $(this).prop("id", "disqus_thread_"+$(this).data("thread-id"));
                    $(this).siblings('.lazy-load-disqus').show();
                })

                var disqusInit = function () {  
                    var config = disqus_configs["post_"+post_ID];
                    this.page = $.extend(this.page, config.page);
                    this.language = config.language;
                    this.callbacks.preData = [];
                    this.callbacks.preData.push(function() {
                        // clear out the container (its filled for SEO/legacy purposes)
                        document.getElementById("disqus_thread").innerHTML = '';
                    });
                    <?php if (!get_option('disqus_manual_sync')): ?>
                    this.callbacks.onReady.push(config.manual_sync);
                    <?php endif; ?>
                    if(config.sso){
                        this.sso = config.sso;
                    }
                  };
                if(window.DISQUS === undefined){
                    window.disqus_config = disqusInit;
                } else {
                    DISQUS.reset({
                      reload: true,
                      config: disqusInit
                    });
                }
                
            })(jQuery)
        }
        window.unloadComments = function(post_ID){
            (function($){
                var thread = $(".disqus_thread").filter(function(){
                    $(this).html("");
                    return $(this).data("thread-id") == post_ID;
                }).prop("id", "disqus_thread");
                //console.log(thread);

                $(".disqus_thread").not(thread).each(function(){
                    $(this).prop("id", "disqus_thread_"+$(this).data("thread-id"));
                });

                $(".lazy-load-disqus a").filter(function(){
                    return $(this).data("thread-id") == post_ID;
                }).parents(".lazy-load-disqus").show();
            })(jQuery)
        }
        jQuery(document).on("click", ".lazy-load-disqus a", function(e){
            e.preventDefault();
            var link = jQuery(this);
            link.parent().hide();
            loadComments(link.data("thread-id"));
        })
    }
    
    
    
    /*var disqus_url = '<?php echo get_permalink(); ?>';
    var disqus_identifier = '<?php echo dsq_identifier_for_post($post); ?>';
    //var disqus_container_id = 'disqus_thread_<?php the_ID(); ?>';
    //var disqus_domain = '<?php echo DISQUS_DOMAIN; ?>';
    var disqus_shortname = '<?php echo strtolower(get_option('disqus_forum_url')); ?>';
    var disqus_title = <?php echo cf_json_encode(dsq_title_for_post($post)); ?>;*/
    <?php if (false && get_option('disqus_developer')): ?>
        var disqus_developer = 1;
    <?php endif; ?>
/* ]]> */
</script>

<script type="text/javascript">
/* <![CDATA[ */
    var DsqLocal = {
        'trackbacks': [
<?php
    $count = 0;
    foreach ($comments as $comment) {
        $comment_type = get_comment_type();
        if ( $comment_type != 'comment' ) {
            if( $count ) { echo ','; }
?>
            {
                'author_name':    <?php echo cf_json_encode(get_comment_author()); ?>,
                'author_url':    <?php echo cf_json_encode(get_comment_author_url()); ?>,
                'date':            <?php echo cf_json_encode(get_comment_date('m/d/Y h:i A')); ?>,
                'excerpt':        <?php echo cf_json_encode(str_replace(array("\r\n", "\n", "\r"), '<br />', get_comment_excerpt())); ?>,
                'type':            <?php echo cf_json_encode($comment_type); ?>
            }
<?php
            $count++;
        }
    }
?>
        ],
        'trackback_url': <?php echo cf_json_encode(get_trackback_url()); ?>
    };
/* ]]> */
</script>

<script type="text/javascript">
/* <![CDATA[ */
(function() {
    var dsq = document.getElementById("disqus_script");
    /*jQuery(document).on("click", ".lazy-load-disqus a", function(e){
        e.preventDefault();
        loadComments("<?php the_ID(); ?>");
    })*/
    if(dsq){
        //loadComments()
    } else {
        dsq = document.createElement('script'); dsq.type = 'text/javascript';
        dsq.async = true;
        dsq.id = "disqus_script"
        dsq.src = '//' + current_disqus_config.page.shortname + '.' + '<?php echo DISQUS_DOMAIN; ?>' + '/embed.js?pname=wordpress&pver=<?php echo DISQUS_VERSION; ?>';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    }
})();
/* ]]> */
</script>
