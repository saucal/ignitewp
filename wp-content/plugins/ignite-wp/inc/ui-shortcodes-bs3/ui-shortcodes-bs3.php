<?php

class SUISC_stack {
    var $perc = 0;
    var $countStrikes = array(array());
}

global $SUISC_stack;
$SUISC_stack = array();

function SUISC_getCurrStack() {
    global $SUISC_stack;
    $last = array_values($SUISC_stack);
    $last = array_pop($last);

    if($last)
        return $last;
    else
        return false;
}

function SUISC_removeFromStack() {
    global $SUISC_stack;
    array_pop($SUISC_stack);
}

function SUISC_addNewStack() {
    global $SUISC_stack;
    array_push($SUISC_stack, new SUISC_stack());
}

function SUISC_printElem($str, $atts, $cols, $totalCols){
    $currStack = SUISC_getCurrStack();
    if(!$currStack)
        return "";

    $SUISC_perc = &$currStack->perc;
    $SUISC_countStrikes = &$currStack->countStrikes;

    $thisPerc = $cols/$totalCols*100;

    $ret = "";
    $additionalClass = array();

    if($cols == 1 && $totalCols == 1){
        $tagClass = "one-full"; 
        $additionalClass[] = "col-md-12";
    }
    if($cols == 1 && $totalCols == 2){
        $tagClass = "one-half"; 
        $additionalClass[] = "col-md-6";
    }
    if($cols == 1 && $totalCols == 3){
        $tagClass = "one-third"; 
        $additionalClass[] = "col-md-4";
    }
    if($cols == 2 && $totalCols == 3){
        $tagClass = "two-third"; 
        $additionalClass[] = "col-md-8";
    }
    if($cols == 1 && $totalCols == 4){
        $tagClass = "one-fourth"; 
        $additionalClass[] = "col-md-3";
    }
    if($cols == 2 && $totalCols == 4) {
        $tagClass = "two-fourth";    
        $additionalClass[] = "col-md-6";     
    }
    if($cols == 3 && $totalCols == 4){
        $tagClass = "three-fourth"; 
        $additionalClass[] = "col-md-9";
    }

    if($SUISC_countStrikes[0][0] == $tagClass){
        array_shift($SUISC_countStrikes[0]);
        if(empty($SUISC_countStrikes[0])) {
            array_push($atts, "last");
            array_shift($SUISC_countStrikes);
            $SUISC_countStrikes = array_values($SUISC_countStrikes);
        } else {
            $SUISC_countStrikes[0] = array_values($SUISC_countStrikes[0]);
        }
    }

    if (in_array("first", $atts) || $SUISC_perc == 0) {
        $additionalClass[] = "first";
        $ret .= '<div class="row">';
    }
    if (in_array("last", $atts) || ceil($SUISC_perc + $thisPerc) == 100) {
        $additionalClass[] = "last";
    } 
    $SUISC_perc += $thisPerc;
    if(ceil($SUISC_perc) >= 100) $SUISC_perc = 0;
	
	if (isset($atts['class']))
		$additionalClass[] = $atts['class'];


    $ret .= "<div class='".$tagClass." sc-column ".implode(" ", $additionalClass)."'>".do_shortcode($str)."</div>";

    if(in_array("last", $additionalClass))
        $ret .= '</div>';

    return $ret;
}

function SUISC_resetPercCount($content){
    SUISC_removeFromStack();
    return $content;
}

function SUISC_count($m) {
    $currStack = SUISC_getCurrStack();
    if(!$currStack)
        return "";

    $SUISC_perc = &$currStack->perc;
    $SUISC_countStrikes = &$currStack->countStrikes;

    if(in_array($m[2], array("one-full", "one-half", "one-third", "one-fourth", "two-third", "two-fourth", "three-fourth"))){
        end($SUISC_countStrikes); 
        $elem = &$SUISC_countStrikes[key($SUISC_countStrikes)];
        $elem[] = $m[2];
        reset($SUISC_countStrikes);
    } else {
        $SUISC_countStrikes[] = array();
    }
}

function SUISC_preFlight($content) {
    SUISC_addNewStack();

    global $shortcode_tags;

    if ( false === strpos( $content, '[' ) ) {
        return $content;
    }

    if (empty($shortcode_tags) || !is_array($shortcode_tags))
        return $content;

    $pattern = get_shortcode_regex();

    preg_replace_callback( "/$pattern/s", 'SUISC_count', $content );

    return $content;
}

add_filter("the_content", "SUISC_preFlight", 9);
add_filter("acf_the_content", "SUISC_preFlight", 9);

add_filter("the_content", "SUISC_resetPercCount", 12); //This resets the percentage fill count to 0 after the shortcodes has been executed.
add_filter("acf_the_content", "SUISC_resetPercCount", 12); //This resets the percentage fill count to 0 after the shortcodes has been executed.

add_shortcode( "one-full", function($atts, $cont = NULL){
    if(empty($atts)) $atts = array();
    return SUISC_printElem($cont, $atts, 1, 1);
});

add_shortcode( "one-half", function($atts, $cont = NULL){
    if(empty($atts)) $atts = array();
    return SUISC_printElem($cont, $atts, 1, 2);
});

add_shortcode( "one-third", function($atts, $cont = NULL){
    if(empty($atts)) $atts = array();
    return SUISC_printElem($cont, $atts, 1, 3);
});

add_shortcode( "two-third", function($atts, $cont = NULL){
    if(empty($atts)) $atts = array();
    return SUISC_printElem($cont, $atts, 2, 3);
});

add_shortcode( "one-fourth", function($atts, $cont = NULL){
    if(empty($atts)) $atts = array();
    return SUISC_printElem($cont, $atts, 1, 4);
});

add_shortcode( "two-fourth", function($atts, $cont = NULL){
    if(empty($atts)) $atts = array();
    return SUISC_printElem($cont, $atts, 2, 4);
});

add_shortcode( "three-fourth", function($atts, $cont = NULL){
    if(empty($atts)) $atts = array();
    return SUISC_printElem($cont, $atts, 3, 4);
});

?>