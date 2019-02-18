<?php
/*
Plugin Name: Ignite WP Framework
Plugin URI: https://github.com/saucal/ignitewp
Description: IgniteWP - A WordPress Theme Framework
Version: 1.0
Author: Saucal Studios
Author URI: http://saucal.com/
*/
define( 'SAUCAL_TPL_BASEURL', get_template_directory_uri() );
define( 'SAUCAL_TPL_BASE', get_template_directory() );
define( 'SAUCAL_STL_BASEURL', get_stylesheet_directory_uri() );
define( 'SAUCAL_STL_BASE', get_stylesheet_directory() );
define( 'IGNITE_BASE_URL', rtrim( plugin_dir_url( __FILE__ ), '/' ) );
define( 'IGNITE_BASE', rtrim( plugin_dir_path( __FILE__ ), '/\\' ) );
define( 'IGNITE_INCL', IGNITE_BASE . '/inc/' );

//Init theme libraries
require_once( IGNITE_INCL . 'core.php' );

//Define TPL_ID constant
add_action(
	'after_setup_theme',
	function() {
		if ( ! defined( 'SAUCAL_TPL_ID' ) ) {
			define( 'SAUCAL_TPL_ID', 'saucal' );
		}
	}
);

add_action(
	'wp_enqueue_scripts',
	function() {
		global $wp_scripts;
		$wp_scripts->registered['underscore']->args = null; //make underscore load where needed, not only in footer forced scripts
	}
);
