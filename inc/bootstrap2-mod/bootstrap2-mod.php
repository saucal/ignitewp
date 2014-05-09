<?php

add_action( "init", function(){
    wp_register_script( SAUCAL_TPL_ID."-bootstrap2", SAUCAL_TPL_LIB_URL(__FILE__)."/js/bootstrap.min.js", array(), "2.0", false );
    wp_register_script( SAUCAL_TPL_ID."-bootstrap2-mod", SAUCAL_TPL_LIB_URL(__FILE__)."/js/bootstrap-responsive-extension.js", array(SAUCAL_TPL_ID."-bootstrap2"), "1.0", false );

    wp_register_style( SAUCAL_TPL_ID."-bootstrap2", SAUCAL_TPL_LIB_URL(__FILE__)."/css/bootstrap.min.css", array(), "2.0" );
    wp_register_style( SAUCAL_TPL_ID."-bootstrap2-responsive", SAUCAL_TPL_LIB_URL(__FILE__)."/css/bootstrap-responsive.min.css", array(SAUCAL_TPL_ID."-bootstrap2"), "2.0" );
    wp_register_style( SAUCAL_TPL_ID."-bootstrap2-mod", SAUCAL_TPL_LIB_URL(__FILE__)."/css/bootstrap-responsive-extension.css", array(SAUCAL_TPL_ID."-bootstrap2-responsive"), "1.0" );
    
});
add_action( "wp_enqueue_scripts", function(){
    wp_enqueue_style( SAUCAL_TPL_ID."-bootstrap2" );
}, 5);
add_action( "wp_enqueue_scripts", function(){
    wp_enqueue_script( SAUCAL_TPL_ID."-bootstrap2-mod" );
    wp_enqueue_style( SAUCAL_TPL_ID."-bootstrap2-mod" );
}, 1000);
?>