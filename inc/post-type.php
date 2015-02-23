<?php
if(!class_exists("SaucalCPT")){
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
				"public" => true,
				"capability_type" => "page",
				'exclude_from_search' => true,
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

			$cleanOpts = $this->opts;
			unset($cleanOpts["single_name"]);
			unset($cleanOpts["plural_name"]);
			unset($cleanOpts["slug_for_archive"]);
			unset($cleanOpts["taxonomies"]);

			register_post_type( $slug,
				array_merge(array(
					'labels' => $labels,
					//'public' => true,
					'has_archive' => $slug_for_archive,
					//'exclude_from_search' => true,
					//'menu_icon' => $menu_icon,
					//'capability_type' => 'page',
					//'hierarchical' => $hierarchical,
					//'supports' => $supports,
					'taxonomies' => $taxonomies_for_post_type,
				), $cleanOpts)
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
		
			$this->register_meta_boxes();
		}
		
		function register_meta_boxes(){
			$meta_boxes = $this->opts["meta_boxes"];
			return register_custom_meta_boxes($this->opts["slug"], $this->opts["meta_boxes"]);
		}
		
	}
}

if(!class_exists("SaucalCMB")){
	Class SaucalCMB {
		var $defaults;
		var $opts;
		function SaucalCMB($post_type, $metaboxes = array(), $template = false){
			$this->defaults = array(
				"slug" => $post_type,
				"meta_boxes" => $metaboxes,
				"template" => $template
			);

			if(is_array($metaboxes)) {
				$this->opts = array_merge($this->defaults, $metaboxes);
			}
			extract($this->opts);
			if(function_exists("register_field_group"))	{
				$parsed_meta_boxes = $this->parse_meta_boxes_for_acf();
				foreach($parsed_meta_boxes as $box){
					register_field_group($box);
				}
			} else if(!empty($this->opts["meta_boxes"])) {
				add_action("admin_notices", function() {
				    ?>
				    <div class="error">
				        <p><?php echo "You're using meta fields, but you don't have Advanced Custom Fields Installed. Please install it for this part to work."; ?></p>
				    </div>
				    <?php
				});
			}
		}

		private function parse_fields_recursive($orig_fields, $path) {
			$fields = array();
			foreach($orig_fields as $meta_key => $field) {

				$thisFieldKey = $path."_".$meta_key;
				$newField = array(
					'key' => $thisFieldKey,
					'label' => $field["name"],
					'name' => $meta_key,
					'type' => $field["type"],
				);

				unset($field["name"]);
				unset($field["type"]);

				$defaults = array();
				switch ($newField["type"]) {
					case 'text':
						$defaults = array(
							'default_value' => '',
							'placeholder' => '',
							'prepend' => '',
							'append' => '',
							'formatting' => 'html',
							'maxlength' => '',
						);
						break;
					
					case "textarea":
					case "paragraph":
						$newField["type"] = "textarea";
						$defaults = array(
							'default_value' => '',
							'placeholder' => '',
							'maxlength' => '',
							'rows' => '',
							'formatting' => 'br',
						);
						break;

					case "wysiwyg":
						$defaults = array(
							'default_value' => '',
							'toolbar' => 'full',
							'media_upload' => 'yes',
						);
						break;

					case "image":
						$defaults = array(
							'save_format' => 'object',
							'preview_size' => 'thumbnail',
							'library' => 'all',
						);
						break;

					case "file":
						$defaults = array(
							'save_format' => 'object',
							'library' => 'all',
						);
						break;

					case "post_list":
					case "post_object":
						$field["type"] = "post_object";
						$defaults = array(
							'post_type' => array('all'),
							'taxonomy' => array('all'),
							'allow_null' => 0,
							'multiple' => 0,
						);
						if(!empty($field["post_type"]) && !is_array($field["post_type"])){
							$defaults["post_type"] = array($field["post_type"]);
							unset($field["post_type"]);
						}
						break;

					case "user":
					case "user_list":
						$field["type"] = "user";
						$defaults = array(
							'role' => array (
								0 => 'all',
							),
							'field_type' => 'select',
							'allow_null' => 0,
						);
						break;

					case "select":
						$defaults = array(
							'choices' => array(),
							'default_value' => '',
							'allow_null' => 0,
							'multiple' => 0,
						);
						break;

					default:
						# code...
						break;
				}

				$newField = array_merge($newField, $defaults);
				$newField = array_merge($newField, $field);
				
				$fields[] = $newField;
			}
			return $fields;
		}

		function parse_meta_boxes_for_acf() {
			$boxes = array();
			$defaults = array(
				"title" => "Meta Box",
				"fields" => array(),
				"position" => "normal",
			);
			foreach($this->opts["meta_boxes"] as $box_id => $box){
				$box = array_merge($defaults, $box);
				$display_condition = array(
					array(
						array(
							'param' => 'post_type',
							'operator' => '==',
							'value' => $this->opts["slug"],
						)
					)
				);
				if($this->opts["template"] !== false && is_string($this->opts["template"])) {
					$display_condition[0][] = array(
						'param' => 'page_template',
						'operator' => '==',
						'value' => $this->opts["template"],
					);
				}

				foreach($display_condition as $group_no => $conds){
					foreach($conds as $order_no => $cond) {
						$display_condition[$group_no][$order_no] = array_merge($display_condition[$group_no][$order_no], array(
							"order_no" => $order_no,
							"group_no" => $group_no,
						));
					}
				}

				$thisBoxId = $this->opts["slug"]."_".$box_id;

				$metaData = array(
					'id' => $thisBoxId,
					'title' => $box["title"],
					'fields' => $this->parse_fields_recursive($box["fields"], $thisBoxId),
					'location' => $display_condition,
					'options' => array(
						'position' => $box["position"],
						'layout' => 'default',
						'hide_on_screen' => array(),
					),
				);
				$boxes[] = $metaData;
			}
			return $boxes;
		}
	}
}

if(!function_exists("register_custom_post_type")){
	function register_custom_post_type($name, $attr = null) {
		return new SaucalCPT($name, $attr);
	}
}
if(!function_exists("register_custom_meta_boxes")){
	function register_custom_meta_boxes($post_type, $meta_boxes = array(), $template = false) {
		return new SaucalCMB($post_type, $meta_boxes, $template);
	}
}


?>