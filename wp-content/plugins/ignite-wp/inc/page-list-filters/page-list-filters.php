<?php
Class SaucalPageListFilter {
	var $template;
	function __construct($template, $options = array()) {
		$this->template = $template;
		add_filter( 'views_edit-page', array($this, "filter_add") );
		add_filter( 'query_vars', array(__CLASS__, "add_query_vars") );
		add_action( 'pre_get_posts', array(__CLASS__, "pre_get_posts") );
		add_action( 'pre_get_posts', array($this, "filter_template") );
	}
	public static function add_query_vars( $qvars ) {
		$qvars[] = 'page_template';
		return $qvars;
	}
	public static function pre_get_posts( $wpq ) {
		if($wpq->is_main_query() && is_admin() && $wpq->get("post_type", "post") == "page" && $wpq->get("page_template", "") != "") {
			$wpq->set('meta_key', '_wp_page_template');
			$wpq->set('meta_value', $wpq->get("page_template", "").'.php');
		}
	}
	function filter_template( $wpq ) {
		if($wpq->is_main_query() && is_admin() && $wpq->get("post_type", "post") == "page" && $wpq->get("page_template", "") == "") {
			$__not_in = $wpq->get("post__not_in", array());
			foreach($this->get_templated() as $id){
				if(!in_array($id, $__not_in)) {
					$__not_in[] = $id;
				}
			}
			$__not_in = array_values($__not_in);
			$wpq->set("post__not_in", $__not_in);
		}
	}
	function get_templated_count() {
		return count($this->get_templated());
	}
	function get_templated() {
		$wpq = new WP_Query(array(
			"post_type" => "page",
			'meta_key' => '_wp_page_template',
			'meta_value' => $this->template.'.php',
			'fields' => "ids",
			"posts_per_page" => -1
		));

		return $wpq->posts;
	}
	function filter_add( $views ) {
		$count = $this->get_templated_count();
		if($count > 0) {
			$title = $this->template;
			foreach(get_page_templates() as $name => $template) {
				if($template == $this->template.".php") {
					$title = $name;
					break;
				}
			}
			$class = "";
			if(get_query_var("page_template", "") == $this->template) {
				$class = 'class="current"';
			}
			$views[$this->template] = '<a href="'.esc_attr("edit.php?page_template=".$this->template."&post_type=page").'" '.$class.' >'.$title.' <span class="count">('.$count.')</span></a>';
		}
	    return $views;
	}
}

function add_page_list_filter($template) {
	new SaucalPageListFilter($template);
}
?>