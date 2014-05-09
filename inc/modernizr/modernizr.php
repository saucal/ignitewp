<?php

add_action( "init", function(){
    wp_register_script( SAUCAL_TPL_ID."-modernizr", SAUCAL_TPL_LIB_URL(__FILE__)."/js/modernizr-2.6.2-respond-1.1.0.min.js", array(), "2.6.2", false );
});
add_action( "wp_enqueue_scripts", function(){
    wp_enqueue_script( SAUCAL_TPL_ID."-modernizr" );
}, 1000);
?>