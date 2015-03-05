<?php
add_action( "init", function(){
    wp_register_script( SAUCAL_TPL_ID."-layout-builders", SAUCAL_TPL_LIB_URL(__FILE__)."/js/layout-builders.js", array("jquery"), "1.0", false );
});
add_action( "wp_enqueue_scripts", function(){
    wp_enqueue_script( SAUCAL_TPL_ID."-layout-builders" );
}, 5);
?>