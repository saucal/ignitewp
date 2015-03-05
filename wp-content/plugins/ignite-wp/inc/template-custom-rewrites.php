<?php 
class SaucalCTR
{
	var $rules = array();
	var $vars = array('custom_template');
	function SaucalCTR() {
		add_action( 'init', array($this, "add_rules"));
		add_filter( 'query_vars', array($this, "add_vars"));
		add_filter( 'template_include', function( $template ) {
			global $wp;
			if ( isset($wp->query_vars["custom_template"])  ) {
				$new_template = locate_template( array( 'custom-'.$wp->query_vars["custom_template"].'.php' ) );
				if ( '' != $new_template ) {
					return $new_template ;
				}
			}
			return $template;
		}, 99 );


	}
	function add_rule($redirect, $template, $vars = array()){
		foreach($vars as $var){
			if(!in_array($var, $this->vars)){
				$this->vars[] = $var;
			}
		}
		$this->rules[$redirect] = array(
			"template" => $template,
			"vars" => $vars,
		);
	}
	function add_vars( $query_vars ){
		foreach($this->vars as $var){
			if(!in_array($var, $query_vars)){
				$query_vars[] = $var;
			}
		}
	    return $query_vars;
	}
	function add_rules(){
		foreach($this->rules as $redirect => $data){
			$target = 'index.php?custom_template='.$data["template"];
			if(!empty($data["vars"])){
				foreach($data["vars"] as $key => $var){
					$target .= '&'.$var."=".'$matches['.($key+1).']';
				}
			}
			add_rewrite_rule(trim($redirect, "$").'$', $target, 'top');
		}
	}
}

$SCTRManager = new SaucalCTR();

function add_custom_template_rewrite($rewrite, $template, $vars = array()){
	global $SCTRManager;
	$SCTRManager->add_rule($rewrite, $template, $vars);
}

function is_custom_template_rewrite($template = "") {
	global $wp;
	if(empty($template)){
		return isset($wp->query_vars["custom_template"]);
	} else {
		if(!isset($wp->query_vars["custom_template"]))
			return false;

		if($wp->query_vars["custom_template"] == $template)
			return true;
		else
			return false;
	}
}
function is_not_custom_template_rewrite($templates = array()) {
	global $wp;
	$found = true;
	if(!is_array($templates))
		$templates = array($templates);
	foreach($templates as $template) {
		if(is_custom_template_rewrite($template)){
			$found = false;
		}
	}
	return $found;
}
?>