<?php 
define("SAUCAL_TPL_ID", "saucal");

//Add theme support
add_theme_support( 'post-thumbnails' );

//Register Nav Menu
register_nav_menus( array(
    'main_menu' => 'Main Menu'
));

add_action("init", function(){
	wp_register_script( SAUCAL_TPL_ID."-theme-main", SAUCAL_TPL_BASEURL."/js/main.js", array("saucal-jquery-extension"), "1.0", false );
	wp_register_style( SAUCAL_TPL_ID."-theme-main", SAUCAL_TPL_BASEURL."/css/main.less", array(), "1.0" );
});

add_action( "wp_enqueue_scripts", function(){
	wp_enqueue_script( SAUCAL_TPL_ID."-theme-main" );
	wp_enqueue_style( SAUCAL_TPL_ID."-theme-main" );
});	

if(function_exists("add_ignite_support")) {
	// You should call the add_ignite_support function here to load the modules you want
} else {
	add_action("admin_notices", function() {
	    ?>
	    <div class="error">
	        <p><?php echo "This theme will not work as expected unless you install the Ignite WP Framework Plugin."; ?></p>
	    </div>
	    <?php
	});
	return;
}

// After that, you should code as usual, making use of the modules at will.


?>