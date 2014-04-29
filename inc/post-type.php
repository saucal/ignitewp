<?php

Class SaucalCPT {
	var $defaults;
	var $opts;
	public function SaucalCPT($name, $attr = null){
		$this->defaults = array(
			"slug" => $name,
			"slug_for_archive" => $name,
			"single_name" => "Post",
			"plural_name" => "Posts",
			"taxonomies" => array(),
			'menu_icon' => null,
			"hierarchical" => true,
			"supports" => array('thumbnail','title', 'editor', 'page-attributes'),
			"editor_columns" => array(
				'cb' => '<input type="checkbox" />',
				'title' => 'Title',
				"author" => 'Author',
				"date" => 'Date'
			),
			"meta_boxes" => array(),
		);

		if($attr !== null && is_array($attr)){
			$this->opts = array_merge($this->defaults, $attr);
		}
		extract($this->opts);


		//Create custom taxonomies for posts
		$taxonomies_for_post_type = array();
		foreach($taxonomies as $tax){
			if(is_array($tax)) {
				register_taxonomy($tax["slug"], $slug, $tax["config"]);
				
				
				//register taxonomy column
				$func = create_function('$column, $post_id', '
					switch ($column)
					{
						case "'.$tax["slug"].'":  
							if ( $category_list = get_the_term_list( $post_id, "'.$tax["slug"].'", "", ", ", "" ) ) {
								echo $category_list;
							} else {
								echo "None";
							}
							break; 
					}');    
				add_action('manage_'.$slug.'_posts_custom_column',  $func, 10, 2);
				
				if(isset($tax["filter_by"])){
					if($tax["filter_by"] == true){
						$func = create_function('', '
							global $typenow;
							global $wp_query;
							if ($typenow == "'.$slug.'") {
								$taxonomy = "'.$tax["slug"].'";
								$business_taxonomy = get_taxonomy($taxonomy);
								wp_dropdown_categories(array(
									"show_option_all" =>  "Show All {$business_taxonomy->label}",
									"taxonomy"        =>  $taxonomy,
									"name"            =>  "'.$tax["slug"].'",
									"orderby"         =>  "name",
									"selected"        =>  isset($wp_query->query["'.$tax["slug"].'"]) ? $wp_query->query["'.$tax["slug"].'"] : false,
									"hierarchical"    =>  true,
									"depth"           =>  3,
									"show_count"      =>  true,
									"hide_empty"      =>  true
								));
							}
							');    
						add_action('restrict_manage_posts', $func);	
						
						$func = create_function('', '
							global $pagenow;
							$qv = &$query->query_vars;
							if ($pagenow == "edit.php" && isset($qv["'.$tax["slug"].'"]) && is_numeric($qv["'.$tax["slug"].'"]) && $qv["'.$tax["slug"].'"] != "0") {
								$term = get_term_by("id", $qv["'.$tax["slug"].'"], "'.$tax["slug"].'");
								$qv["'.$tax["slug"].'"] = $term->slug;
							}
							');    
						add_filter( 'parse_query', $func );
					}
				}
				array_push($taxonomies_for_post_type, $tax["slug"]);
			} elseif (is_string($tax)) {
				array_push($tax);
			}
		}
		
		
		//Register post type and taxonomies
		$labels = array(
			'name' => __($plural_name),
			'singular_name' => __($single_name),
			'add_new_item' => __('Add New '.$single_name),
			'edit_item' => __('Edit '.$single_name),
			'new_item' => __('New '.$single_name),
			'view_item' => __('View '.$single_name),
			'search_items' => __('Search '.$single_name),
			'not_found' =>  __('No '.strtolower($plural_name).' found'),
			'not_found_in_trash' => __('No '.strtolower($plural_name).' found in Trash'),
			'parent_item_colon' => __('Parent '.$single_name),
			'menu_name' => __($plural_name),
			'all_items' => __($plural_name),
			'items_archive' => __($single_name." Archive")
		);
		register_post_type( $slug,
			array(
				'labels' => $labels,
				'public' => true,
				'has_archive' => $slug_for_archive,
				'exclude_from_search' => true,
				'menu_icon' => $menu_icon,
				'capability_type' => 'page',
				'hierarchical' => $hierarchical,
				'supports' => $supports,
				'taxonomies' => $taxonomies_for_post_type
			)
		);
		
		
		
		//Customize columns
		global $custom_columns_for_editor;
		$custom_columns_for_editor[$slug] = array();
		foreach($editor_columns as $colname => $label){
			//if(!in_array($colname, array("cb","title","author","categories"."tags","comments","date"))){
				if($colname == "thumbnail"){
					$func = create_function('', 'echo \'<style type="text/css" media="screen"> .column-thumbnail { width: 52px; text-align: center!important; } </style>\';');    
					add_action( 'admin_head', $func );
				}
			//}
			$custom_columns_for_editor[$slug][$colname] = $label;
		}
		$func = create_function('$columns', 'global $custom_columns_for_editor; return $custom_columns_for_editor["'.$slug.'"];');
		add_filter('manage_'.$slug.'_posts_columns', $func);
		
		$func = create_function('$column, $post_id', '
			switch ($column)
			{
				case "thumbnail":
					$width = (int) 35;
					$height = (int) 35;
					// Display the featured image in the column view if possible
					if (has_post_thumbnail()) {
						the_post_thumbnail( array($width, $height) );
					} else {
						echo "None";
					}
					break;
			}
		');
		add_action('manage_'.$slug.'_posts_custom_column',  $func, 10, 2);
	
		add_action("add_meta_boxes", array($this, "register_meta_boxes"));
		add_action('save_post', array( $this, 'save_meta_box' ) );
		
		
	}
	function register_meta_boxes(){
		//global $wp_meta_boxes;
		//var_export($wp_meta_boxes);
		//exit;
		$meta_boxes = $this->opts["meta_boxes"];
		foreach($meta_boxes as $id => $meta_box) {
			$mbDefaults = array(
				"position" => "side",
	            "title" => "Meta Box",
	            "fields" => array(),
	            "priority" => "default"
			);

			$meta_box = array_merge($mbDefaults, $meta_box);
			add_meta_box( "meta_box_".$id, $meta_box["title"], array($this, "render_meta_box"), $this->opts["slug"], $meta_box["position"], $meta_box["priority"], array("meta_box_id" => "meta_box_".$id, "meta_box" => $meta_box) );
		}
		/*var_export($wp_meta_boxes);
		exit;*/
	}
	function render_meta_box($post, $caller){
		$metabox = $caller["args"]["meta_box"];
		$metaboxID = $caller["args"]["meta_box_id"];
		// Add an nonce field so we can check for it later.
		wp_nonce_field( $metaboxID, $metaboxID.'[_wpnonce]' );

		foreach($metabox["fields"] as $meta => $field){
			// Use get_post_meta to retrieve an existing value from the database.
			$value = get_post_meta( $post->ID, '_'.$meta, true );

			$fieldId = $post->post_type.'_'.$meta;
			// Display the form, using the current value.
			echo '<p><label for="'.$fieldId.'">';
			_e( $field["name"], 'myplugin_textdomain' );
			echo '</label></p>';
			echo "<p>";
			if($field["type"] == "paragraph"){
				echo '<textarea class="widefat" id="'.$fieldId.'" rows="5" name="'.$metaboxID.'['.$meta.']" value="' . esc_attr( $value ) . '" >'.$value.'</textarea>';
            } else if($field["type"] == "user_list") {
            	wp_dropdown_users(array(
            		"show_option_all" => " ",
            		"name" => $metaboxID.'['.$meta.']',
            		"class" => "widefat",
            		"id" => $fieldId,
            		"selected" => empty($value) ? "0" : $value,
            	));
            } else {
				echo '<input class="widefat" type="text" id="'.$fieldId.'" name="'.$metaboxID.'['.$meta.']"';
					echo ' value="' . esc_attr( $value ) . '" />';
            }
			echo "</p>";
		}
	}

	function save_meta_box($post_id){
		// If this is an autosave, our form has not been submitted,
                //     so we don't want to do anything.
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) 
			return $post_id;

		/*
		 * We need to verify this came from the our screen and with proper authorization,
		 * because save_post can be triggered at other times.
		 */

		$meta_boxes = $this->opts["meta_boxes"];
		foreach($meta_boxes as $id => $meta_box) {
			$metaboxID = "meta_box_".$id;
			$thisPost = $_POST[$metaboxID];

			
			// Check if our nonce is set.
			if ( ! isset( $thisPost["_wpnonce"] ) )
				continue;

			$nonce = $thisPost["_wpnonce"];

			// Verify that the nonce is valid.
			if ( ! wp_verify_nonce( $nonce, $metaboxID ) )
				continue;

			if ( ! current_user_can( 'edit_post', $post_id ) )
				continue;

			foreach($meta_box["fields"] as $meta => $field){
				//var_dump($meta);
				if(isset($thisPost[$meta])){
					$newVal = $thisPost[$meta];
					update_post_meta( $post_id, '_'.$meta, $newVal );
					//var_dump($post_id, '_'.$meta, $newVal);
				} 
			}
			//var_dump($thisPost);
			//exit;

			
		}
		return $post_id;
	}
}

if(!function_exists("register_custom_post_type")){
	function register_custom_post_type($name, $attr = null) {
		return new SaucalCPT($name, $attr);
	}
}


?>