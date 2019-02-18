<?php
//Require modules
add_ignite_support( 'transit' );
add_ignite_support( 'js-imagesloaded' );

ignite_register_script( 'jquery-ignitewall', 'js/ignitewall.js', array( 'jquery', 'saucal-jquery-extension' ), '1.0', false, 5 );
ignite_register_style( 'jquery-ignitewall', 'css/ignitewall.css', false, '1.0', 'all', 6 );

