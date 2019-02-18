<?php
add_action(
	'init',
	function() {
		wp_register_style( SAUCAL_TPL_ID . '-perfect-scrollbar', SAUCAL_TPL_LIB_URL( __FILE__ ) . '/css/perfect-scrollbar.css', array(), '0.5.8', false );
		wp_register_script( SAUCAL_TPL_ID . '-perfect-scrollbar', SAUCAL_TPL_LIB_URL( __FILE__ ) . '/js/perfect-scrollbar.js', array( 'jquery' ), '0.5.8', false );
		wp_register_script( SAUCAL_TPL_ID . '-more-perfect-scrollbar', SAUCAL_TPL_LIB_URL( __FILE__ ) . '/js/more-perfect-scrollbar.js', array( SAUCAL_TPL_ID . '-perfect-scrollbar', 'saucal-jquery-extension' ), '0.1', true );
	}
);
add_action(
	'wp_enqueue_scripts',
	function() {
		wp_enqueue_script( SAUCAL_TPL_ID . '-more-perfect-scrollbar' );
		wp_enqueue_style( SAUCAL_TPL_ID . '-perfect-scrollbar' );
	},
	1
);

