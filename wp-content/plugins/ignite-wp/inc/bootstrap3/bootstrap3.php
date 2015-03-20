<?php
add_action( "init", function(){
	$url = SAUCAL_TPL_LIB_URL(__FILE__);
	$themeDir = SAUCAL_TPL_BASE."/inc/bootstrap3";
	$ver = "3.3.2";
	if(file_exists($themeDir) && is_dir($themeDir)) {
		$url = SAUCAL_TPL_BASEURL."/inc/bootstrap3";
		$ver = "3.x.custom";
	}
    wp_register_script( SAUCAL_TPL_ID."-bootstrap3", $url."/js/bootstrap.min.js", array(), $ver, false );

    wp_register_style( SAUCAL_TPL_ID."-bootstrap3", $url."/css/bootstrap.min.css", array(), $ver );
    wp_register_style( SAUCAL_TPL_ID."-bootstrap3-theme", $url."/css/bootstrap-theme.min.css", array(SAUCAL_TPL_ID."-bootstrap3"), $ver );
});
add_action( "wp_enqueue_scripts", function(){
    wp_enqueue_style( SAUCAL_TPL_ID."-bootstrap3" );
}, 5);
add_action( "wp_enqueue_scripts", function(){
    wp_enqueue_script( SAUCAL_TPL_ID."-bootstrap3" );
    wp_enqueue_style( SAUCAL_TPL_ID."-bootstrap3-theme" );
}, 1000);
?>