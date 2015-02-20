<?php 
function saucal_clean_file_version($src){
	if(strpos($src, SAUCAL_TPL_BASEURL) === false) //this ignores anything outside ignite
		return $src;

	if(strpos($src, SAUCAL_TPL_BASEURL."/inc") === 0) //this condition ignores module scripts, as they are considered mostly static.
		return $src;
	
	if(strpos($src, "?") !== false){
		list( $clean, $query ) = explode("?", $src, 2);
	} else {
		$clean = $src;
	}

	$path = str_replace(SAUCAL_TPL_BASEURL, SAUCAL_TPL_BASE, $clean);
	if(file_exists($path)) {
		$src = add_query_arg(array("ver" => date("Ymd-Hi", filemtime($path))), $src);
	}
	return $src;
}
add_filter("script_loader_src", "saucal_clean_file_version", 100000);
add_filter("style_loader_src", "saucal_clean_file_version", 100000);
?>