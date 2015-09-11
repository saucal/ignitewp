<?php
ignite_register_style("gravity-forms-css-reset", "css/gravity-forms-css-reset.css", array(), "1.0", false, 100 );
ignite_register_script("gravity-forms-css-reset", "js/gravity-forms-css-reset.js", array("jquery"), "1.0", false, 100 );

if(class_exists("RGFormsModel")) {
	add_action("wp_enqueue_scripts", function(){
		$forms = RGFormsModel::get_forms( null, 'title' );
		foreach ( $forms as $_form ) {
			$form = RGFormsModel::get_form_meta( $_form->id );
			if ( isset( $form['id'] ) ) {
				require_once( GFCommon::get_base_path() . '/form_display.php' );
				GFFormDisplay::enqueue_form_scripts( $form, true );
			}
		}
	});
}

?>