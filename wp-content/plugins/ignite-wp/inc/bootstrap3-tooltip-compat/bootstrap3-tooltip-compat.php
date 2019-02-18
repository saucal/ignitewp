<?php
add_ignite_support( 'js-layout-builders' );

/*
This module uses code extracted from bootstrap, and modified to avoid conflicts using it in WP-Admin
*/
ignite_register_script( 'ignite-transition', 'js/ignite-transition.js', array( 'jquery' ), '3.3.4', false );
ignite_register_script( 'ignite-modal', 'js/ignite-modal.js', array( 'ignite-transition' ), '3.3.4', false, 6 );
ignite_register_script( 'ignite-modal-helper', 'js/ignite-modal-helper.js', array( 'ignite-modal' ), '1.0', false, 6 );
ignite_register_style( 'ignite-modal', 'css/ignite-modal.css', false, '3.3.4', false, 6 );

