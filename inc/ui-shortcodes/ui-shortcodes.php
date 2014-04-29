<?php
function SUISC_firstLastClasses($atts){
	$additionalClass = "";
    if (in_array("first", $atts)) {
        $additionalClass .= "first ";
    }
    if (in_array("last", $atts)) {
        $additionalClass .= "last ";
    } 
    return $additionalClass;
}
add_shortcode( "one-third", function($atts, $cont = NULL){
    if(empty($atts)) $atts = array();
    $ret = "";
    $additionalClass = SUISC_firstLastClasses($atts);
    
    $ret .= "<div class='one-third ".$additionalClass."'>".do_shortcode($cont)."</div>";
    return $ret;
});
add_shortcode( "two-third", function($atts, $cont = NULL){
    if(empty($atts)) $atts = array();
    $ret = "";
    $additionalClass = SUISC_firstLastClasses($atts);
    
    $ret .= "<div class='two-third ".$additionalClass."'>".do_shortcode($cont)."</div>";
    return $ret;
});

add_shortcode( "one-half", function($atts, $cont = NULL){
    if(empty($atts)) $atts = array();
    $ret = "";
    $additionalClass = SUISC_firstLastClasses($atts);
    
    $ret .= "<div class='one-half ".$additionalClass."'>".do_shortcode($cont)."</div>";
    return $ret;
});

add_shortcode( "one-fourth", function($atts, $cont = NULL){
    if(empty($atts)) $atts = array();
    $ret = "";
    $additionalClass = SUISC_firstLastClasses($atts);
    
    $ret .= "<div class='one-fourth ".$additionalClass."'>".do_shortcode($cont)."</div>";
    return $ret;
});

add_shortcode( "two-fourth", function($atts, $cont = NULL){
    if(empty($atts)) $atts = array();
    $ret = "";
    $additionalClass = SUISC_firstLastClasses($atts);
    
    $ret .= "<div class='two-fourth ".$additionalClass."'>".do_shortcode($cont)."</div>";
    return $ret;
});

add_shortcode( "three-fourth", function($atts, $cont = NULL){
    if(empty($atts)) $atts = array();
    $ret = "";
    $additionalClass = SUISC_firstLastClasses($atts);
    
    $ret .= "<div class='three-fourth ".$additionalClass."'>".do_shortcode($cont)."</div>";
    return $ret;
});

add_action( "init", function(){
    //global $wp_styles;
    wp_register_style( SAUCAL_TPL_ID."-ui-shortcodes", SAUCAL_TPL_LIB_URL(__FILE__)."/css/ui-shortcodes.css", array(), "3.0" );
    //var_dump($wp_styles);
});

add_action( "wp_enqueue_scripts", function(){
    wp_enqueue_style( SAUCAL_TPL_ID."-ui-shortcodes" );
});

?>