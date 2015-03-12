<?php
//Require modules
add_ignite_support("ajax-request");
add_ignite_support("js-layout-builders");
add_ignite_support("transit");

class Saucal_IgniteBox {
	function Saucal_IgniteBox() {
		add_action("wp_enqueue_scripts", array($this, "wp_enqueue_scripts"));
		add_action("init", array($this, "init"));
		add_action("wp_ajax_"."get_ignitebox_info", array($this, "get_ignitebox_info"));
		add_action("wp_ajax_nopriv_"."get_ignitebox_info", array($this, "get_ignitebox_info"));
		add_filter("wp_get_attachment_image_attributes", array($this, "wp_get_attachment_image_attributes"), 10, 3);
	}
	function init(){
		wp_register_script( "ignitebox", SAUCAL_TPL_LIB_URL(__FILE__)."/js/ignitebox.js", array("jquery", "underscore"), "1.0", false );
		wp_register_style( "ignitebox-style", SAUCAL_TPL_LIB_URL(__FILE__)."/css/ignitebox.css", array(), "1.0", false );
	}
	function wp_enqueue_scripts(){
		wp_enqueue_script("ignitebox");
		wp_enqueue_style("ignitebox-style");
	}
	function get_ignitebox_info(){
		$_ids = $_REQUEST["ids"];
		$ids = json_decode($_ids);
		if(!$ids)
			$ids = json_decode(stripslashes($_ids));

		$newArray = array();
		foreach($ids as $id){
			$data = wp_prepare_attachment_for_js($id);
			if($data) {
				$newArray[$data["id"]] = array(
					"title" => $data["title"],
					"caption" => $data["caption"],
					"id" => $data["id"],
					"url" => $data["url"],
					"width" => $data["sizes"]["full"]["width"],
					"height" => $data["sizes"]["full"]["height"],
					"link" => $data["link"],
					"guid" => add_query_arg(array("p" => $data["id"]), home_url("/")),
				);
			}
		}

		die(json_encode($newArray));
	}
	function wp_get_attachment_image_attributes($attr, $attachment, $size){
		$attr["data-wp-image"] = $attachment->ID;
		return $attr;
	}
}
new Saucal_IgniteBox();
?>