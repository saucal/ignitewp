<?php 
/*
Plugin Name: Ignite WP Framework
Plugin URI: https://github.com/saucal/ignitewp
Description: IgniteWP - A WordPress Theme Framework
Version: 1.0
Author: Saucal Studios
Author URI: http://saucal.com/
*/
define("SAUCAL_TPL_BASEURL", get_stylesheet_directory_uri());
define("SAUCAL_TPL_BASE", get_stylesheet_directory());
define("IGNITE_BASE_URL", rtrim(plugin_dir_url( __FILE__ ), "/"));
define("IGNITE_BASE", rtrim(plugin_dir_path( __FILE__ ), "/\\"));
define("IGNITE_INCL", IGNITE_BASE."/inc/");

//Init theme libraries
require_once(IGNITE_INCL."core.php");

//Disable Admin Bar
show_admin_bar( false ); 

//Define TPL_ID constant
add_action("after_setup_theme", function(){
	if(!defined("SAUCAL_TPL_ID"))
		define("SAUCAL_TPL_ID", "saucal");
});

add_action("init", function(){
	wp_register_script( "saucal-jquery-extension", IGNITE_BASE_URL."/js/inc/saucal-jquery-extension.js", array("underscore", "jquery"), "3.0", false );
});

?>