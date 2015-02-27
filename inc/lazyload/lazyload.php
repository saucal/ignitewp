<?php
require_once SAUCAL_TPL_LIB_DIR(__FILE__)."/inc/"."phpQuery-onefile.php";

class Saucal_Lazy_Load_Patcher {
	var $output = "";
	function Saucal_Lazy_Load_Patcher() {
		add_action("wp_enqueue_scripts", array($this, "wp_enqueue_scripts"));
		add_action("init", array($this, "init"));
		add_action("shutdown", array($this, "shutdown"));
	}
	function init(){
		wp_register_script( "lazy-load-xt", "//cdnjs.cloudflare.com/ajax/libs/jquery.lazyloadxt/1.0.5/jquery.lazyloadxt.min.js", array("jquery"), "1.0.5", false );
		wp_register_style( "lazy-load-xt-fadein", "//cdnjs.cloudflare.com/ajax/libs/jquery.lazyloadxt/1.0.5/jquery.lazyloadxt.fadein.min.css", array(), "1.0.5" );
		wp_register_script( "saucal-lazy-load-xt-integration", SAUCAL_TPL_LIB_URL(__FILE__)."/js/lazyloadxt-integration.js", array("jquery"), "1.0", false );
		ob_start(array($this, "catch_output"));
	}
	function wp_enqueue_scripts(){
		wp_enqueue_script("lazy-load-xt");
		wp_enqueue_script("saucal-lazy-load-xt-integration");
		wp_enqueue_style("lazy-load-xt-fadein");	
	}
	function catch_output($ret){
		$this->output = $ret;
		return "";
	}
	static function parse_lazy($html) {
		$doc = phpQuery::newDocument($html, "text/html");
		$blankImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
		$selector_containers = apply_filters("lazy_load_selector_containers", array());
		$selector = apply_filters("lazy_load_selector", "img");
		$fullSelector = "";
		foreach($selector_containers as $container) {
			if(!empty($fullSelector))
				$fullSelector .= ", ";

			$fullSelector .= $container." ".$selector;
		}
		if(empty($fullSelector))
			$fullSelector = $selector;

		foreach(pq($fullSelector) as $node) {
			$clone    = $node->cloneNode();
			$noscript = pq("<noscript/>", $doc);
			$noscript->append($clone)->insertBefore($node);
			$node->setAttribute('data-src', $node->getAttribute('src'));
			$node->setAttribute('src',      $blankImage);
			$node->setAttribute('class',    trim($node->getAttribute('class') . ' lazy'));
		}
		$new_html = $doc->htmlOuter();
		return $new_html;
	}
	function shutdown() {
		if(strpos($this->output, "<") == 0 && !is_admin()) {
			echo self::parse_lazy($this->output);
		} else {
			echo $this->output;
		}
	}
}
new Saucal_Lazy_Load_Patcher();
?>