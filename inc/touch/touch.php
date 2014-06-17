<?php
add_action( "init", function(){
    wp_register_script( SAUCAL_TPL_ID."-touche", SAUCAL_TPL_LIB_URL(__FILE__)."/js/touche.min.js", array("jquery"), "1.0", false );
});
add_action( "wp_enqueue_scripts", function(){
    wp_enqueue_script( SAUCAL_TPL_ID."-touche" );
}, 5);
?>