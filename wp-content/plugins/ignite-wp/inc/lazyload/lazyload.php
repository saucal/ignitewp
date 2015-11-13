<?php
add_ignite_support("dom_parser");
require_once SAUCAL_TPL_LIB_DIR(__FILE__)."/inc/"."placehold_it.php";

class Saucal_Lazy_Load_Patcher {
	var $output = "";
	function Saucal_Lazy_Load_Patcher() {
		add_action("wp_enqueue_scripts", array($this, "wp_enqueue_scripts"));
		add_action("init", array($this, "init"));
		add_action("shutdown", array($this, "shutdown"));
	}
	function init(){
		wp_register_script( "lazy-load-xt", "//cdnjs.cloudflare.com/ajax/libs/jquery.lazyloadxt/1.0.5/jquery.lazyloadxt.min.js", array("jquery"), "1.0.5", false );
		wp_register_script( "lazy-load-xt-srcset", "//cdnjs.cloudflare.com/ajax/libs/jquery.lazyloadxt/1.0.5/jquery.lazyloadxt.srcset.min.js", array("lazy-load-xt"), "1.0.5", false );
		wp_register_style( "lazy-load-xt-fadein", "//cdnjs.cloudflare.com/ajax/libs/jquery.lazyloadxt/1.0.5/jquery.lazyloadxt.fadein.min.css", array(), "1.0.5" );
		wp_register_script( "saucal-lazy-load-xt-integration", SAUCAL_TPL_LIB_URL(__FILE__)."/js/lazyloadxt-integration.js", array("jquery"), "1.0", false );
		ob_start(array($this, "catch_output"));
	}
	function wp_enqueue_scripts(){
		wp_enqueue_script("lazy-load-xt");
		wp_enqueue_script("lazy-load-xt-srcset");
		wp_enqueue_script("saucal-lazy-load-xt-integration");
		wp_enqueue_style("lazy-load-xt-fadein");	
	}
	function catch_output($ret){
		$this->output = $ret;
		return "";
	}
	static function parse_lazy($html) {
		if(substr($html, 0, 5) == "<?xml")
			return $html;
		
		$html = str_get_html($html, true, true, DEFAULT_TARGET_CHARSET, false);
		$blankImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
		$placehold_it = new Placehold_it();
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

		foreach($html->find($fullSelector) as $node) {
			$origImg = $node->outertext."";

			$node->{"data-src"} = $node->src;

			if(isset($node->srcset)) {
				$node->{"data-srcset"} = $node->srcset;
				$node->srcset = null;
			}

			$width = $node->width;
			$height = $node->height;
			if($width && $height){
				$node->src = $placehold_it->get($width, $height);
			} else {
				$node->src = $blankImage;
			}

			$node->class = trim($node->class . ' lazy');
			$node->outertext = "<noscript>".$origImg."</noscript>".$node->outertext;
		}
		$new_html = $html->save();
		return $new_html;
	}
	function shutdown() {
		if(strpos(trim($this->output), "<") == 0 && !is_admin()) {
			echo self::parse_lazy($this->output);
		} else {
			echo $this->output;
		}
	}
}
new Saucal_Lazy_Load_Patcher();
?>