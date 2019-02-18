<?php
add_action(
	'init',
	function() {
		wp_register_script( SAUCAL_TPL_ID . '-ajax-request', SAUCAL_TPL_LIB_URL( __FILE__ ) . '/js/ajax-request.js', array( 'jquery' ), '1.0', false );
	}
);

add_action(
	'wp_enqueue_scripts',
	function() {
		wp_enqueue_script( SAUCAL_TPL_ID . '-ajax-request' );
		wp_localize_script( SAUCAL_TPL_ID . '-ajax-request', 'ajax_url', admin_url( 'admin-ajax.php' ) );
	},
	100
);

