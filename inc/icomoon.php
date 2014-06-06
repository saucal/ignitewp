<?php 
if(file_exists(SAUCAL_TPL_BASE."/icomoon/style.css")){
	add_action("init", function(){
		wp_register_style( SAUCAL_TPL_ID."-icomoon-pack", SAUCAL_TPL_BASEURL."/icomoon/style.css", array(), "1.0" );
	});
	add_action( "wp_enqueue_scripts", function(){
		wp_enqueue_style( SAUCAL_TPL_ID."-icomoon-pack" );
	});
}
?>