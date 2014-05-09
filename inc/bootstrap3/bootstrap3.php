<?php

add_action( "init", function(){
    wp_register_script( SAUCAL_TPL_ID."-bootstrap3", SAUCAL_TPL_LIB_URL(__FILE__)."/js/bootstrap.min.js", array(), "3.1.1", false );

    wp_register_style( SAUCAL_TPL_ID."-bootstrap3", SAUCAL_TPL_LIB_URL(__FILE__)."/css/bootstrap.min.css", array(), "3.1.1" );
    wp_register_style( SAUCAL_TPL_ID."-bootstrap3-theme", SAUCAL_TPL_LIB_URL(__FILE__)."/css/bootstrap-theme.min.css", array(SAUCAL_TPL_ID."-bootstrap3"), "3.1.1" );
});
add_action( "wp_enqueue_scripts", function(){
    wp_enqueue_style( SAUCAL_TPL_ID."-bootstrap3" );
}, 5);
add_action( "wp_enqueue_scripts", function(){
    wp_enqueue_script( SAUCAL_TPL_ID."-bootstrap3" );
    wp_enqueue_style( SAUCAL_TPL_ID."-bootstrap3-theme" );
}, 1000);
?>