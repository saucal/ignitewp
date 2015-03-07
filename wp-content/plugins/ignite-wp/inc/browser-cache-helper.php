<?php 
function saucal_clean_file_version($src){
	$ignorePaths = apply_filters("ignite_browser_cache_helper_paths", array(SAUCAL_TPL_BASEURL));

	foreach($ignorePaths as $path) {
		if(strpos($src, $path) === false) //this ignores anything outside ignite
			continue;
		
		if(strpos($src, "?") !== false){
			list( $clean, $query ) = explode("?", $src, 2);
		} else {
			$clean = $src;
		}

		$root = rtrim(ABSPATH, "/\\");
		$rootUrl = home_url();

		$path = str_replace($rootUrl, $root, $clean);
		if(file_exists($path)) {
			$src = add_query_arg(array("ver" => date("Ymd-Hi", filemtime($path))), $src);
		}
	}
	return $src;
}
add_filter("script_loader_src", "saucal_clean_file_version", 100000);
add_filter("style_loader_src", "saucal_clean_file_version", 100000);
?>