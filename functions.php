<?php 
define("SAUCAL_TPL_ID", "saucal");
define("SAUCAL_TPL_BASEURL", get_stylesheet_directory_uri());
define("SAUCAL_TPL_BASE", get_stylesheet_directory());
define("SAUCAL_TPL_INCL", SAUCAL_TPL_BASE."/inc/");

//Load all libraries
if ($handle = opendir(SAUCAL_TPL_INCL)) {
    while (false !== ($file = readdir($handle))) {
        if ('.' === $file) continue;
        if ('..' === $file) continue;

        if(!is_dir($file))
        	require_once(SAUCAL_TPL_INCL.$file);
    }
    closedir($handle);
}

//Disable Admin Bar
show_admin_bar( false ); 

//Add theme support
add_theme_support( 'post-thumbnails' );

//Register Nav Menu
register_nav_menus( array(
    'main_menu' => 'Main Menu'
));

add_action("init", function(){
	wp_register_script( "saucal-jquery-extension", SAUCAL_TPL_BASEURL."/js/inc/saucal-jquery-extension.js", array("jquery"), "3.0", false );

	wp_register_script( SAUCAL_TPL_ID."-theme-main", SAUCAL_TPL_BASEURL."/js/main.js", array("saucal-jquery-extension"), "1.0", false );

	wp_register_style( SAUCAL_TPL_ID."-theme-main", SAUCAL_TPL_BASEURL."/css/main.less", array(), "1.0" );
});

add_action( "wp_enqueue_scripts", function(){
	wp_enqueue_script( SAUCAL_TPL_ID."-theme-main" );
	wp_enqueue_style( SAUCAL_TPL_ID."-theme-main" );
});	




?>