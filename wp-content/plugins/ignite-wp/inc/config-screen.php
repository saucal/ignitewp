<?php
class Settings_Screen {
	var $opts = array(); 
    function Settings_Screen( $opts ) {
    	$this->opts = array_merge(array(
    		"title" => "Settings Page",
    		"settings" => array(),
    		"slug" => "settings",
            "parent" => 'options-general.php',
            'capability' => 'manage_options'
    	), $opts);

        if( function_exists('acf_add_options_page') ) {

            if(!empty($this->opts["parent"]) || !empty($this->opts["parent_slug"])) {
                acf_add_options_sub_page(array_intersect_key($this->opts, array_fill_keys(array("title", "slug", "parent", "parent_slug", "capability"), "")));
            } else {
                $keys = array_intersect_key($this->opts, array_fill_keys(array("title", "slug", "capability"), ""));
                $keys = array_merge($keys, array(
                    "redirect" => false
                ));
                acf_add_options_page( $keys );
            }

            add_ignite_support("acf-parser");
            $boxes = new ACF_Parser($this->opts["settings"], array(
                "options_page" => $this->opts["slug"]
            ));
            $parsed_meta_boxes = $boxes->get_parsed();
            foreach($parsed_meta_boxes as $box){
                register_field_group($box);
            }
            
        } else {
            add_filter( 'admin_init' , array( &$this , 'register_fields' ) );
            add_action( 'admin_menu', array( &$this , 'settings_menu' ) );
        }
    }
    function register_fields() {
	    foreach ($this->opts["settings"] as $section_slug => $section) {
	    	$section_slug = $this->opts["slug"].'-'.$section_slug;
	    	add_settings_section($section_slug , '', array(&$this, 'section_one_callback'), $this->opts["slug"] );
		    foreach ($section["fields"] as $meta => $settingOpts) {
		    	$this->add_setting($meta, $section_slug, $settingOpts);
		    };
		};
    }
    function add_setting($meta, $section, $options){
    	$options = array_merge(array(
    		"name" => "Setting",
    		"save_function" => "esc_attr",
    		"get_function" => false,
    		"type" => "text",
    		"meta" => $meta
    	), $options);
    	extract($options);
    	register_setting( $this->opts["slug"].'-group', $meta, $save_function );
        add_settings_field($meta, '<label for="'.$meta.'">'.$name.'</label>' , array(&$this, 'fields_html') , $this->opts["slug"], $section, $options );
    }
    function section_one_callback() {
	    //echo 'Some help text goes here.';
	}
    function fields_html($args) {
    	$meta = $args["meta"];
    	if($args["get_function"]) {
    		$value = call_user_func($args["get_function"]);
    	} else {
    		$value = get_option( $meta, '' );
    	}
    	$type = $args["type"];

    	switch ($type) {
    		case 'textarea':
    		case 'paragraph':
        		echo '<textarea class="widefat" id="'.$meta.'" name="'.$meta.'" rows="6" style="resize: vertical;">'.$value.'</textarea>';
    			break;
    		
    		default:
        		echo '<input class="widefat" type="text" id="'.$meta.'" name="'.$meta.'" value="' . $value . '" />';
    			break;
    	}
    }
	function settings_menu() {
	    add_options_page( $this->opts["title"], $this->opts["title"], 'manage_options', $this->opts["slug"], array( &$this , 'settings_page' ) );
	}
	function settings_page() {
	    ?>
	    <div class="wrap">
	        <h2><?= $this->opts["title"]; ?></h2>
	        <form action="options.php" method="POST">
	            <?php settings_fields( $this->opts["slug"].'-group' ); ?>
	            <?php do_settings_sections( $this->opts["slug"] ); ?>
	            <?php submit_button(); ?>
	        </form>
	    </div>
	    <?php
	}
}