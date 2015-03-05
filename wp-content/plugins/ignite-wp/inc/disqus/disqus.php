<?php 
add_action("init", function(){
    global $wp_filter;
    //var_dump($wp_filter["comments_template"]);
    if(function_exists("dsq_comments_template")){
        remove_filter('comments_template', 'dsq_comments_template');
        add_filter('comments_template', 'mjt_comments_template');
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

function mjt_sso_login(){
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

function mjt_comments_template($value) {
    global $EMBED;
    global $post;
    global $comments;

    if ( !( is_singular() && ( have_comments() || 'open' == $post->comment_status ) ) ) {
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
?>