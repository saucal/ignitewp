<?php 
add_action("init", function(){
    global $wp_filter;
    //var_dump($wp_filter["comments_template"]);
    if(function_exists("dsq_comments_template")){
        remove_filter('comments_template', 'dsq_comments_template');
        add_filter('comments_template', 'mjt_comments_template');
    }
    //var_dump($wp_filter["comments_template"]);
    //exit;
});

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

//var_dump(SAUCAL_TPL_BASE . '/disqus-comments-template.php');
//var_dump(file_exists(SAUCAL_TPL_LIB_DIR(__FILE__) . '/theme/disqus-comments-template.php'));

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
    //return SAUCAL_TPL_BASE . '/disqus-comments-template.php';
    return SAUCAL_TPL_LIB_DIR(__FILE__) . '/theme/disqus-comments-template.php';
}
?>