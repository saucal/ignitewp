<?php
add_ignite_support("history-api-helper");
add_ignite_support("js-imagesloaded");

if((isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') || isset($_REQUEST["iframed"])) {
    define("SAUCAL_IS_AJAX_REQUEST", true);
} else {
    define("SAUCAL_IS_AJAX_REQUEST", false);
}
function saucal_get_header(){
    if(!SAUCAL_IS_AJAX_REQUEST){
        get_header();
    } else {
        global $wp;
        ?>
        <div class="url-helper" style="display: none;"><?php echo trailingslashit(home_url( $wp->request )); ?></div>
        <div class="title-helper" style="display: none;"><?php wp_title(); ?></div>
        <div <?php body_class("body-class-helper"); ?> style="display: none;"></div>
        <?php
        do_action("saucal_ajax_get_header");
    }
}
function saucal_get_footer(){
    if(!SAUCAL_IS_AJAX_REQUEST){
        get_footer();
    } else {
    	do_action("saucal_ajax_get_header");
    }
}

add_action( "init", function(){
    wp_register_script( SAUCAL_TPL_ID."-ajax-api", SAUCAL_TPL_LIB_URL(__FILE__)."/js/ajax-api.js", array("jquery-imagesloaded"), "4.0", false );
});

add_action( "wp_enqueue_scripts", function(){
    wp_localize_script( SAUCAL_TPL_ID."-ajax-api", "ajax_api", array(
        "admin_url" => admin_url(),
        "login_url" => wp_login_url()
    ));
    wp_localize_script( SAUCAL_TPL_ID."-ajax-api", "ajax_api_config", apply_filters("ajax_api_config", array(
        "contentSelector" => "#content",
        "menuSelector" => array(
            "menu" => "#header ul.menu",
            "item" => "li.menu-item"
        ),
        "loader" => array(
            "show" => null,
            "hide" => null
        ),
        "autoInit" => true,
        "linkSelector" => "a"
    )));
    wp_enqueue_script( SAUCAL_TPL_ID."-ajax-api" );
}, 100);
?>