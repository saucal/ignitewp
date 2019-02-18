<?php
add_action(
	'init',
	function() {
		wp_register_script( SAUCAL_TPL_ID . '-bootstrap3-tooltip', SAUCAL_TPL_LIB_URL( __FILE__ ) . '/js/bootstrap-tooltip.js', array( 'jquery' ), '1.1', false );
		wp_register_script( SAUCAL_TPL_ID . '-bootstrap3-forms-generator', SAUCAL_TPL_LIB_URL( __FILE__ ) . '/js/bootstrap-forms-generator.js', array( 'jquery' ), '1.1', false );
	}
);
add_action(
	'wp_enqueue_scripts',
	function() {
		wp_enqueue_script( SAUCAL_TPL_ID . '-bootstrap3-tooltip' );
		wp_enqueue_script( SAUCAL_TPL_ID . '-bootstrap3-forms-generator' );
	},
	6
);

