<?php
Class Saucal_FakeTag {
	function Saucal_FakeTag($tag) {
		$this->tag = $tag;
		add_shortcode($this->tag, array($this, "print_tag"));
	}
	function print_tag($atts, $cont = null) {
		$atts = shortcode_atts( array(
			'class' => '',
		), $atts );
		return '<div class="'.$this->tag.' '.$atts["class"].'">'.do_shortcode($cont).'</div>';
	}
}

$h1 = new Saucal_FakeTag("h1");
$h2 = new Saucal_FakeTag("h2");
$h3 = new Saucal_FakeTag("h3");
$h4 = new Saucal_FakeTag("h4");
$h5 = new Saucal_FakeTag("h5");
$h6 = new Saucal_FakeTag("h6");
?>