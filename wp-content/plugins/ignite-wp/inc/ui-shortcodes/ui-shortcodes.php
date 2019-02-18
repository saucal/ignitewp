<?php
global $SUISC_perc;
$SUISC_perc = 0;

function SUISC_firstLastClasses( $atts, $cols, $totalCols ) {
	global $SUISC_perc;
	$thisPerc = $cols / $totalCols * 100;

	$additionalClass = '';
	if ( in_array( 'first', $atts ) || $SUISC_perc == 0 ) {
		$additionalClass .= 'first ';
	}
	if ( in_array( 'last', $atts ) || ceil( $SUISC_perc + $thisPerc ) == 100 ) {
		$additionalClass .= 'last ';
	}
	$SUISC_perc += $thisPerc;
	if ( ceil( $SUISC_perc ) >= 100 ) {
		$SUISC_perc = 0;
	}

	if ( isset( $atts['class'] ) ) {
		$additionalClass .= ' ' . $atts['class'];
	}

	return $additionalClass;
}

function SUISC_resetPercCount( $content ) {
	global $SUISC_perc;
	$SUISC_perc = 0;
	return $content;
}

add_filter( 'the_content', 'SUISC_resetPercCount', 12 ); //This resets the percentage fill count to 0 after the shortcodes has been executed.


add_shortcode(
	'one-full',
	function( $atts, $cont = null ) {
		if ( empty( $atts ) ) {
			$atts = array();
		}
		$ret = '';
		$additionalClass = SUISC_firstLastClasses( $atts, 1, 1 );

		$ret .= "<div class='one-full sc-column " . $additionalClass . "'>" . do_shortcode( $cont ) . '</div>';
		return $ret;
	}
);

add_shortcode(
	'one-half',
	function( $atts, $cont = null ) {
		if ( empty( $atts ) ) {
			$atts = array();
		}
		$ret = '';
		$additionalClass = SUISC_firstLastClasses( $atts, 1, 2 );

		$ret .= "<div class='one-half sc-column " . $additionalClass . "'>" . do_shortcode( $cont ) . '</div>';
		return $ret;
	}
);

add_shortcode(
	'one-third',
	function( $atts, $cont = null ) {
		if ( empty( $atts ) ) {
			$atts = array();
		}
		$ret = '';
		$additionalClass = SUISC_firstLastClasses( $atts, 1, 3 );

		$ret .= "<div class='one-third sc-column " . $additionalClass . "'>" . do_shortcode( $cont ) . '</div>';
		return $ret;
	}
);

add_shortcode(
	'two-third',
	function( $atts, $cont = null ) {
		if ( empty( $atts ) ) {
			$atts = array();
		}
		$ret = '';
		$additionalClass = SUISC_firstLastClasses( $atts, 2, 3 );

		$ret .= "<div class='two-third sc-column " . $additionalClass . "'>" . do_shortcode( $cont ) . '</div>';
		return $ret;
	}
);

add_shortcode(
	'one-fourth',
	function( $atts, $cont = null ) {
		if ( empty( $atts ) ) {
			$atts = array();
		}
		$ret = '';
		$additionalClass = SUISC_firstLastClasses( $atts, 1, 4 );

		$ret .= "<div class='one-fourth sc-column " . $additionalClass . "'>" . do_shortcode( $cont ) . '</div>';
		return $ret;
	}
);

add_shortcode(
	'two-fourth',
	function( $atts, $cont = null ) {
		if ( empty( $atts ) ) {
			$atts = array();
		}
		$ret = '';
		$additionalClass = SUISC_firstLastClasses( $atts, 2, 4 );

		$ret .= "<div class='two-fourth sc-column " . $additionalClass . "'>" . do_shortcode( $cont ) . '</div>';
		return $ret;
	}
);

add_shortcode(
	'three-fourth',
	function( $atts, $cont = null ) {
		if ( empty( $atts ) ) {
			$atts = array();
		}
		$ret = '';
		$additionalClass = SUISC_firstLastClasses( $atts, 3, 4 );

		$ret .= "<div class='three-fourth sc-column " . $additionalClass . "'>" . do_shortcode( $cont ) . '</div>';
		return $ret;
	}
);

add_action(
	'init',
	function() {
		wp_register_style( SAUCAL_TPL_ID . '-ui-shortcodes', SAUCAL_TPL_LIB_URL( __FILE__ ) . '/css/ui-shortcodes.css', array(), '3.0' );
	}
);

add_action(
	'wp_enqueue_scripts',
	function() {
		wp_enqueue_style( SAUCAL_TPL_ID . '-ui-shortcodes' );
	}
);


