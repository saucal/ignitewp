<?php
//Undo autop around shortcodes.
function fix_autop( $content ) {
	$array = array(
		'<p>[' => '[',
		']</p>' => ']',
		']<br />' => ']',
	);

	$content = strtr( $content, $array );

	return $content;
}
add_action(
	'init',
	function() {
		add_filter( 'the_content', 'fix_autop' );
		add_filter( 'acf_the_content', 'fix_autop' );
	}
);

