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
			"sidebaritem" => "#blog-sidebar > ul > li",
			"blogarea" => "#blog-area",
			"postscontainer" => "#blog-contents",
		),
		"prefixmenuitemid" => "menu-post-",
		"posts_in_sidebar" => 40,
		"posts_initially_loaded" => 10,
		"posts_before_button" => 1,
		"load_prev_posts_button" => '<a href="#">Load More Posts</a>',
		"load_next_posts_button" => '<a href="#">Load More Posts</a>',		
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

function parse_infinite_blog_sidebar_items_query($attrs = array()) {
	global $infiniteScrollConfig;
	$defaults = array(
		"page" => 1,
		"single" => 0,
		"posts_per_page" => $infiniteScrollConfig["posts_in_sidebar"],
		"fields" => "posts",
		"filter" => "",
		"order" => "date_desc",
		"category" => 0,
		"month" => "",
	);
	$attrs = array_merge($defaults, $attrs);
	$attrs = array_merge($attrs, $_REQUEST);
	$attrs = array_intersect_key($attrs, $defaults);

	$catName = get_query_var("category_name");
	if(!empty($catName)) {
		$cat = get_term_by( 'slug', $catName, 'category' );
		if ( $cat )
			$attrs["category"] = $cat->term_id;
	}

	if(is_month()) {
		$year = (int) get_query_var("year", 0);
		$month = (int) get_query_var("monthnum", 0);
		if(!empty($year) && !empty($month)) {
			$attrs["month"] = $year . "-" . $month;
		}
	}

	if(is_single()) {
		$attrs["single"] = get_queried_object_id();
	}
	
	return $attrs;
}

function get_infinite_blog_sidebar_items($attrs = array()) {
	global $infiniteScrollConfig;
	$params = parse_infinite_blog_sidebar_items_query($attrs);

	$attrs = $params;

	$attrs["suppress_filters"] = false;

	if(!empty($attrs["single"]) && !is_array($attrs["single"])){
		$attrs["single"] = array($attrs["single"]);
	}

	if($attrs["page"] == 1) {
		$attrs["offset"] = 0;
	} else {
		$attrs["offset"] = $attrs["posts_per_page"] * ($attrs["page"] - 1);
		if(!empty($attrs["single"])) {
			$attrs["offset"]--;
		}
	}

	$page = $attrs["page"];
	unset($attrs["page"]);

	if(!empty($attrs["single"]) && $attrs["page"] > 1) {
		$attrs["post__not_in"] = $attrs["single"];
	}
	$single = $attrs["single"];
	unset($attrs["single"]);

	if(!empty($attrs["filter"])) {
		$attrs["s"] = $attrs["filter"];
	}
	unset($attrs["filter"]);

	switch (strtolower($attrs["order"])) {
		case 'popular_asc':
			$attrs["order"] = "ASC";
			$attrs["orderby"] = "popularity";
			break;

		case 'popular_desc':
			$attrs["order"] = "DESC";
			$attrs["orderby"] = "popularity";
			break;

		case 'date_asc':
			$attrs["order"] = "ASC";
			$attrs["orderby"] = "post_date";
			break;
		
		case 'date_desc':
		default:
			$attrs["order"] = "DESC";
			$attrs["orderby"] = "post_date";
			break;
	}

	if(!empty($attrs["category"])) {
		$attrs["cat"] = $attrs["category"];
	}
	unset($attrs["category"]);

	if(!empty($attrs["month"])) {
		$month = explode("-", $attrs["month"]);
		$attrs["monthnum"] = $month[1];
		$attrs["year"] = $month[0];
	} else {
		unset($attrs["month"]);
	}

	$posts = new WP_Query($attrs);
	if(!empty($single) && $page == 1){
		$found = false;
		while($posts->have_posts()): $posts->the_post();
			if(get_the_ID() == $single[0])
				$found = true;
		endwhile;

		if(!$found) {
			array_pop($posts->posts);
			$firstPost = get_post($single[0]);
			array_unshift($posts->posts, $firstPost);
		}
		$posts->rewind_posts();
	} 

	if($posts->have_posts()) {
		$initiallyLoaded = $infiniteScrollConfig["posts_initially_loaded"];

		$currentStart = ($page - 1) * $attrs["posts_per_page"];
		$currentElem = $currentStart;

		if(!empty($single) && $page > 1) {
			$posts->found_posts += count($single);
			$posts->max_num_pages = ceil($posts->found_posts / $posts->get("posts_per_page"));
		}

		if(!empty($single)){
			$postID = $single[0];

			foreach($posts->posts as $key => $post){
				if($post->ID == $postID) {
					infinite_blog_patch_post_object($posts->posts[$key]);
				}
			}
			$posts->rewind_posts();
			return $posts;
		}

		$currKey = $currentElem - $currentStart;
		while($currentElem < $initiallyLoaded && isset($posts->posts[$currKey])) {
			infinite_blog_patch_post_object($posts->posts[$currKey]);

			$currentElem++;
			$currKey = $currentElem - $currentStart;
		}
		$posts->rewind_posts();
	}
	$posts->infinite_sidebar_params = $params;
	return $posts;
}

function get_infinite_blog_sidebar($attrs = array()) {
	global $post;
	$lastposts = get_infinite_blog_sidebar_items($attrs);
	$ret["found_posts"] = (int) $lastposts->found_posts;
	$ret["params"] = $lastposts->infinite_sidebar_params;
	ob_start();
	while($lastposts->have_posts()): $lastposts->the_post();
		get_template_part( "infinite", "menu" );
	endwhile;
	$ret["html"] = ob_get_contents();
	ob_end_clean();
	wp_reset_postdata();
	return $ret;
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
	$data["title_tag"] = $wp_title;
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

	if(empty($_REQUEST["req"]))
		$_REQUEST["req"] = "scroll";

	$data = infinite_blog_get_post_data_by_id($_REQUEST["post_id"]);
	echo json_encode($data);
	exit;
}

add_action("wp_ajax_"."get_post_by_id", "infinite_blog_get_post_by_id");
add_action("wp_ajax_nopriv_"."get_post_by_id", "infinite_blog_get_post_by_id");

function infinite_scrolling_sidebar_attr() {
	$query = get_infinite_blog_sidebar();
	echo 'data-page="1" data-found-posts="'.$query["found_posts"].'" ';
	the_blog_filters_params($query["params"]);
}

function get_sidebar_ajax() {
	echo json_encode(get_infinite_blog_sidebar());
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
	echo 'placeholder="'.apply_filters("infinite_search_placeholder", 'Type then press ENTER to filter...' ).'" ';
	if(!empty($wp_query->query_vars["s"])) {
		echo 'value="'.esc_attr($wp_query->get("s")).'" ';
	}
}

function infinite_archive_dropdown() {
	global $wpdb, $wp_locale;
	$last_changed = wp_cache_get( 'last_changed', 'posts' );
	if ( ! $last_changed ) {
		$last_changed = microtime();
		wp_cache_set( 'last_changed', $last_changed, 'posts' );
	}
	$where = "WHERE post_type = 'post' AND post_status = 'publish'";
	$query = "SELECT YEAR(post_date) AS `year`, MONTH(post_date) AS `month`, count(ID) as posts FROM $wpdb->posts $where GROUP BY YEAR(post_date), MONTH(post_date) ORDER BY post_date DESC";
	$key = md5( $query );
	$key = "wp_get_archives:$key:$last_changed";
	if ( ! $results = wp_cache_get( $key, 'posts' ) ) {
		$results = $wpdb->get_results( $query );
		wp_cache_set( $key, $results, 'posts' );
	}
	$output = "";
	if ( $results ) {
		$output .= '<select class="archive-field">';
		$output .= '<option value="">'.esc_attr( __( 'All Dates' ) ).'</option>';

		$year = (int) get_query_var("year", 0);
		$month = (int) get_query_var("monthnum", 0);
		if(!is_month()) {
			$year = $month = 0;
		}
		$currVal = $year . "-" . $month;

		foreach ( (array) $results as $result ) {
			$url = get_month_link( $result->year, $result->month );
			$thisVal = $result->year."-".$result->month;
			/* translators: 1: month name, 2: 4-digit year */
			$text = sprintf( __( '%1$s %2$d' ), $wp_locale->get_month( $result->month ), $result->year );
			$output .= '<option value="'.$thisVal.'" '.($thisVal == $currVal ? 'selected="selected" ' : "").'>'.$text.'</option>';
		}
		$output .= "</select>";
	}
	echo $output;
}

function get_blog_filters($params = NULL) {
	if(!isset($params))
		$params = parse_infinite_blog_sidebar_items_query();

	$ret = array();
	foreach(array("single", "filter", "category", "month") as $key) {
		if(!empty($params[$key])) {
			$ret[$key] = $params[$key];
		}
	}
	return $ret;
}

function the_blog_filters_json($params = NULL) {
	$params = get_blog_filters($params);
	echo json_encode($params);
}

function the_blog_filters_params($params = NULL) {
	$params = get_blog_filters($params);
	foreach($params as $param => $val)
		echo "data-".$param."=\"".esc_attr( $val )."\" ";
}

add_action("saucal_ajax_get_header", function(){
	$filters = get_blog_filters();
	if(!empty($filters)):
	?>
	<div class="blog-helper" style="display: none;"><?php the_blog_filters_json(); ?></div>
	<?php
	endif;
});
?>