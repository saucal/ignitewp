<?php 

add_ignite_support("ajax-request");
add_ignite_support("js-scrollto");

add_action("init", function(){
    global $wp_filter;
    global $withcomments;
    $withcomments = true;
    //var_dump($wp_filter["comments_template"]);
    if(function_exists("dsq_comments_template")){
        remove_filter('comments_template', 'dsq_comments_template');
        add_filter('comments_template', 'ignite_dsq_comments_template');
    }
    wp_register_script( SAUCAL_TPL_ID."-disqus-tools", SAUCAL_TPL_LIB_URL(__FILE__)."/js/disqus-tools.js", array("jquery"), "1.1", false );
    //var_dump($wp_filter["comments_template"]);
    //exit;
});

add_action( "wp_enqueue_scripts", function(){
    wp_enqueue_script( SAUCAL_TPL_ID."-disqus-tools" );
    wp_localize_script( SAUCAL_TPL_ID."-disqus-tools", "disqusGlobalConfig", array(
        "perform_automatic_sync" => !get_option('disqus_manual_sync'),
        "disqus_script_url" => strtolower(get_option('disqus_forum_url')) . '.' . DISQUS_DOMAIN . '/embed.js?pname=wordpress&pver=' . DISQUS_VERSION,
        "default_url" => site_url("/"),
        "language" => apply_filters('disqus_language_filter', ''),
        "shortname" => get_option('disqus_forum_url'),
    ) );
}, 5);

function ignite_dsq_sso_login(){
    global $current_site;
    $sitename = get_bloginfo('name');
    $siteurl = site_url();
    $button = get_option('disqus_sso_button');
    $icon = get_option('disqus_sso_icon');
    $sso_login_str = 'sso = {
          name: "'.$sitename.'",
          button: "'.$button.'",
          icon: "'.$icon.'",
          url: "'.$siteurl.'/wp-login.php",
          logout: "'.$siteurl.'/wp-login.php?action=logout",
          width: "800",
          height: "700"
    }';
    return $sso_login_str;
}

function ignite_dsq_comments_template($value) {
    global $EMBED;
    global $post;
    global $comments;

    if ( !( 'open' == $post->comment_status ) ) {
        return;
    }

    if ( !dsq_is_installed() || !dsq_can_replace() ) {
        return $value;
    }

    // TODO: If a disqus-comments.php is found in the current template's
    // path, use that instead of the default bundled comments.php
    //return TEMPLATEPATH . '/disqus-comments.php';
    $EMBED = true;
    return SAUCAL_TPL_LIB_DIR(__FILE__) . '/theme/disqus-comments-template.php';
}

function _get_disqus_comment_count($post_id) {
    if(empty($post_id))
        return 0;

    global $dsq_api;
    $transient = "dsq_comment_count_".intval($post_id);

    $post = get_post($post_id);
    $identifier = dsq_identifier_for_post($post);
    $title = dsq_title_for_post($post);


    $thread = $dsq_api->api->thread_by_identifier($identifier, $title);

    if(empty($thread) || empty($thread->thread))
        return 0;

    $threadID = $thread->thread->id;

    $dsq_api->api->user_api_key = get_option("disqus_user_api_key");
    if(empty($dsq_api->api->user_api_key))
        return 0;

    $counts = $dsq_api->api->get_num_posts($threadID);
    if(empty($counts) || empty($counts->$threadID))
        return 0;

    $counts = $counts->$threadID;

    $data = (int) $counts[1];

    set_transient( $transient, $data, 5 * MINUTE_IN_SECONDS );

    return $data;
}

function get_disqus_comment_count($post_id) {
    global $dsq_api;
    $transient = "dsq_comment_count_".intval($post_id);
    $data = get_transient( $transient );

    if($data !== false)
        return (int) $data;

    $data = _get_disqus_comment_count($post_id);

    set_transient( $transient, $data, 5 * MINUTE_IN_SECONDS );

    return $data;
}

function ajax_get_comment_count() {
    $post_id = $_REQUEST["post_id"];
    $count = get_disqus_comment_count($post_id);
    die(json_encode($count));
}

add_action("wp_ajax_disqus-comment-count", "ajax_get_comment_count");
add_action("wp_ajax_nopriv_disqus-comment-count", "ajax_get_comment_count");

?>