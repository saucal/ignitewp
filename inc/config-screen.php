<?php
class POSSettings {
	var $opts = array(); 
    function POSSettings( $opts ) {
    	$this->opts = array_merge(array(
    		"title" => "Settings Page",
    		"settings" => array()
    	), $opts);
        add_filter( 'admin_init' , array( &$this , 'register_fields' ) );
        add_action( 'admin_menu', array( &$this , 'pos_settings_menu' ) );
    }
    function register_fields() {
	    add_settings_section( 'pos-general', '', array(&$this, 'section_one_callback'), 'pos-settings' );

	    foreach ($this->opts["settings"] as $meta => $settingOpts) {
	    	$settingOpts = array_merge(array(
	    		"title" => "Setting",
	    		"save_function" => "esc_attr",
	    		"get_function" => false
	    	), $settingOpts);
	    	$this->add_setting($meta, $settingOpts["title"], "pos-general", $settingOpts["save_function"], $settingOpts["get_function"]);
	    };
    }
    function add_setting($meta, $title, $section, $saveClear = "esc_attr", $getFunction = false){
    	register_setting( 'pos-settings-group', $meta, $saveClear );
        add_settings_field($meta, '<label for="'.$meta.'">'.$title.'</label>' , array(&$this, 'fields_html') , 'pos-settings', $section, array(
        	"meta" => $meta,
        	"get_function" => $getFunction
        ) );
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

        echo '<input class="regular-text" type="text" id="'.$meta.'" name="'.$meta.'" value="' . $value . '" />';
    }
	function pos_settings_menu() {
	    add_options_page( $this->opts["title"], $this->opts["title"], 'manage_options', 'pos-settings', array( &$this , 'pos_settings_page' ) );
	}
	function pos_settings_page() {
	    ?>
	    <div class="wrap">
	        <h2><?= $this->opts["title"]; ?></h2>
	        <form action="options.php" method="POST">
	            <?php settings_fields( 'pos-settings-group' ); ?>
	            <?php do_settings_sections( 'pos-settings' ); ?>
	            <?php submit_button(); ?>
	        </form>
	    </div>
	    <?php
	}
}