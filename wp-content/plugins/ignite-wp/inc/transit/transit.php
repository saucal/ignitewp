<?php
//Require modules

class Saucal_Transit {
	function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'wp_enqueue_scripts' ), 3 );
		add_action( 'init', array( $this, 'init' ) );
	}
	function init() {
		wp_register_script( 'jquery-transit', SAUCAL_TPL_LIB_URL( __FILE__ ) . '/js/jquery.transit.min.js', array( 'jquery' ), '0.9.12', false );
		wp_register_script( 'jquery-transit-extension', SAUCAL_TPL_LIB_URL( __FILE__ ) . '/js/jquery.transit.extension.js', array( 'jquery-transit' ), '1.0', false );
	}
	function wp_enqueue_scripts() {
		wp_enqueue_script( 'jquery-transit-extension' );
	}
}
new Saucal_Transit();

