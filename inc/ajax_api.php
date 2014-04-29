<?php
if((isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') || isset($_REQUEST["iframed"])) {
    define("SAUCAL_IS_AJAX_REQUEST", true);
} else {
    define("SAUCAL_IS_AJAX_REQUEST", false);
}
function saucal_get_header(){
    if(!SAUCAL_IS_AJAX_REQUEST){
        get_header();
    } else {
        ?>
        <div class="url-helper" style="display: none;"><?php echo get_permalink(get_queried_object_id()); ?></div>
        <div class="title-helper" style="display: none;"><?php wp_title(); ?></div>
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
?>