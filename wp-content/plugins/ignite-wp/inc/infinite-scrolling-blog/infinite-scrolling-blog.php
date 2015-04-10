<?php
add_ignite_support("ajax-request");
add_ignite_support("history-api-helper");

add_action("init", function(){
	wp_register_script( "saucal-infinite-scrolling-blog", SAUCAL_TPL_LIB_URL(__FILE__)."/js/infinite-scrolling-blog.js", array("jquery"), "1.0", false );
	global $infiniteScrollConfig;
	$infiniteScrollConfig = apply_filters( "infinite-scroll-config", array(
		"selectors" => array(
			"sidebar" => "#blog-sidebar",
			"sidebaritemscont" => "#blog-sidebar > ul",
			"blogarea" => "#blog-area",
			"postscontainer" => "#blog-contents",
		),
		"prefixmenuitemid" => "menu-post-",
		"posts_in_sidebar" => 40,
		"posts_initially_loaded" => 10,
	));
	wp_localize_script( "saucal-infinite-scrolling-blog", "infiniteScrollConfig", $infiniteScrollConfig);
});
add_action("wp_enqueue_scripts", function(){
	wp_enqueue_script("saucal-infinite-scrolling-blog");
}, 5);

function infinite_blog_patch_post_object(&$post) {
	$data = infinite_blog_get_post_data_by_id($post->ID);
	$post->wp_title = $data["title_tag"];
	$post->permalink = $data["permalink"];
}

function get_infinite_blog_sidebar_items($attrs = array()) {
	global $infiniteScrollConfig;
	$defaults = array(
		"page" => 1,
		"ignore" => array(),
		"posts_per_page" => $infiniteScrollConfig["posts_in_sidebar"],
		"fields" => "posts",
		"filter" => ""
	);
	$attrs = array_merge($defaults, $attrs);
	$attrs = array_merge($attrs, $_REQUEST);
	$attrs = array_intersect_key($attrs, $defaults);

	if(!empty($attrs["ignore"]) && !is_array($attrs["ignore"])){
		$attrs["ignore"] = array($attrs["ignore"]);
	}

	if($attrs["page"] == 1) {
		$attrs["offset"] = 0;
	} else {
		$attrs["offset"] = $attrs["posts_per_page"] * ($attrs["page"] - 1);
		if(!empty($attrs["ignore"])) {
			$attrs["offset"]--;
		}
	}

	$page = $attrs["page"];
	unset($attrs["page"]);

	if(!empty($attrs["ignore"])){
		$attrs["post__not_in"] = $attrs["ignore"];
	}
	$ignore = $attrs["ignore"];
	unset($attrs["ignore"]);

	if(!empty($attrs["filter"])) {
		$attrs["s"] = $attrs["filter"];
	}
	unset($attrs["filter"]);

	$posts = get_posts($attrs);
	if(is_single() && $page == 1){
		$found = false;
		foreach($posts as $post)
			if($post->ID == get_queried_object_id())
				$found = true;

		if(!$found) {
			array_pop($posts);
			$firstPost = get_post(get_queried_object_id());
			array_unshift($posts, $firstPost);
		}
	} 

	if(!empty($posts)) {
		$initiallyLoaded = $infiniteScrollConfig["posts_initially_loaded"];

		$currentStart = ($page - 1) * $attrs["posts_per_page"];
		$currentElem = $currentStart;

		if(is_single() || !empty($ignore)){
			$postID = $ignore[0];
			if(is_single())
				$postID = get_queried_object_id();

			foreach($posts as $key => $post){
				if($post->ID == $postID) {
					infinite_blog_patch_post_object($posts[$key]);
				}
			}
			return $posts;
		}

		$currKey = $currentElem - $currentStart;
		while($currentElem < $initiallyLoaded && isset($posts[$currKey])) {
			infinite_blog_patch_post_object($posts[$currKey]);

			$currentElem++;
			$currKey = $currentElem - $currentStart;
		}
	}
	return $posts;
}

function get_infinite_blog_sidebar($attrs = array()) {
	global $post;
	$lastposts = get_infinite_blog_sidebar_items($attrs);
	foreach($lastposts as $post) :
		setup_postdata($post); 
		get_template_part( "infinite", "menu" );
		wp_reset_postdata(); 
	endforeach;
}

function is_first_of_wp_query($id){
	global $wp_query;
	return (!empty($wp_query->posts) && $id == $wp_query->posts[0]->ID);
}

add_action("pre_get_posts", function($wp_query){
	if($wp_query->is_main_query() && !is_admin()){
		if($wp_query->get("post_type") == "" || $wp_query->get("post_type") == "post") {
			global $infiniteScrollConfig;
			$wp_query->set("posts_per_page", $infiniteScrollConfig["posts_initially_loaded"]);
		}
	}
});

function infinite_blog_get_post_data_by_id($id){
	global $wp_query, $wp_the_query;

	$oldQuery = $wp_query;
	$oldTheQuery = $wp_the_query;

	$wp_query = $wp_the_query = new WP_Query(array(
		"p" => $id
	));
	$wp_query->get_posts();

	$data = array();
	ob_start();
	wp_title();
	$wp_title = ob_get_contents();
	ob_end_clean();
	$data["title_tag"] = html_entity_decode($wp_title);
	ob_start();
	while(have_posts()): the_post();
	$data["permalink"] = get_permalink();
	get_template_part("infinite", "post");
	endwhile;
	$conts = ob_get_contents();
	ob_end_clean();
	$data["html"] = $conts;
	if(class_exists("Saucal_Lazy_Load_Patcher")) {
		$data["parsed_html"] = Saucal_Lazy_Load_Patcher::parse_lazy($data["html"]);
		$data["html"] = $data["parsed_html"];
		unset($data["parsed_html"]);
	}
	$wp_the_query = $oldTheQuery;
	$wp_query = $oldQuery;
	return $data;
}

function infinite_blog_get_post_by_id() {
	//this function adds the post type class which doesn't get printed for some reason
	add_filter( "post_class", function($classes, $class, $id){
		$post = get_post($id);
		$classes[] = $post->post_type;
		return $classes;
	}, 10, 3);

	echo json_encode(infinite_blog_get_post_data_by_id($_REQUEST["post_id"]));
	exit;
}

add_action("wp_ajax_"."get_post_by_id", "infinite_blog_get_post_by_id");
add_action("wp_ajax_nopriv_"."get_post_by_id", "infinite_blog_get_post_by_id");

function infinite_scrolling_sidebar_attr() {
	echo 'data-page="1" ';
	if(is_single()) {
		/*$items = get_infinite_blog_sidebar_items(array(
			"fields" => "ids"
		));*/
		echo 'data-ignore="'.get_queried_object_id().'" ';
		/*if(!in_array(get_queried_object_id(), $items)) {
			echo 'data-ignore="'.get_queried_object_id().'" ';
		} else {
			echo 'data-ignore="'.get_queried_object_id().'" ';
		}*/
	}
}

function get_sidebar_ajax() {
	get_infinite_blog_sidebar();
	exit;
}
add_action("wp_ajax_"."get_sidebar", "get_sidebar_ajax");
add_action("wp_ajax_nopriv_"."get_sidebar", "get_sidebar_ajax");

function infinite_scrolling_sidebar_item_attr() {
	global $post;
	if(isset($post->permalink)){
		echo 'data-permalink="'.esc_attr($post->permalink).'" ';
	}
	if(isset($post->wp_title)){
		echo 'data-wptitle="'.esc_attr($post->wp_title).'" ';
	}
}

function infinite_scrolling_search_field_attr() {
	global $wp_query;
	echo 'placeholder="Type then press ENTER to filter..." ';
	if(!empty($wp_query->query_vars["s"])) {
		echo 'value="'.esc_attr($wp_query->get("s")).'" ';
	}
}
?>