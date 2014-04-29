<?php
function SLESS_add_script(){
	?>
	<script>
		less = {
			env: "production"
		};
	</script>
	<script src="<?= SAUCAL_TPL_BASEURL ?>/js/vendor/less-1.7.0.min.js"></script>
	<?php
}

add_filter("style_loader_tag", function($tag){
	if(strpos($tag, ".less") !== false){
		$tag = str_replace(array("rel='stylesheet'", 'rel="stylesheet"'), "rel='stylesheet/less'", $tag);
		add_action( "wp_head", "SLESS_add_script", 100);
	}
	return $tag;
});

?>