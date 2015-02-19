<?php
function SLESS_add_script(){
	?>
	<script>
		less = {
			env: "production"
		};
	</script>
	<!--[if lte IE 8]>         <script src="<?= SAUCAL_TPL_LIB_URL(__FILE__) ?>/js/less-1.3.3.min.js"></script> <![endif]-->
	<!--[if gt IE 8]><!--> <script src="<?= SAUCAL_TPL_LIB_URL(__FILE__) ?>/js/less-2.0.0.min.js"></script> <!--<![endif]-->
	<?php
}

function file_absolute_mtime($lessFilePath) {
	$lessFilePathBase = realpath(dirname($lessFilePath));
	$contents = file_get_contents($lessFilePath); 
	preg_match_all( "/^\s*?@import(?: [^ ]*?)*? [\"\'](.+?)[\"\'].*$/m" , $contents, $importedFiles );

	$filesToBeIncluded = array();
	foreach($importedFiles[1] as $fileToInclude) {
		$thisFilePath = $fileToInclude;
		if(!path_is_absolute($fileToInclude)) {
			$thisFilePath = $lessFilePathBase."/".$fileToInclude;
		}
		if(!file_exists($thisFilePath))
			continue;

		if(substr($thisFilePath, -4) == ".css")
			continue;

		$thisFilePath = realpath($thisFilePath);

		if(!isset($filesToBeIncluded[$thisFilePath]))
			$filesToBeIncluded[$thisFilePath] = filemtime($thisFilePath);

	}
	$m = @filemtime($lessFilePath);
	if(empty($m))
		$m = 0;
	foreach($filesToBeIncluded as $time) {
		if($time > $m)
			$m = $time;
	}
	return $m;
}

add_filter("style_loader_tag", function($tag){
	if(strpos($tag, ".less") !== false){
		require_once SAUCAL_TPL_LIB_DIR(__FILE__) . '/inc/lessc.inc.php';
		$pattern = '/href=([\'"])(.*?)\\1/';
		preg_match($pattern, $tag, $matches);
		$url = "";
		if(!empty($matches[2])){
			$url = $matches[2];
		}

		$compiled = false;
		if(!empty($url)){
			$data = parse_url($url);
			$cleanUrl = "";
			if(!empty($data["scheme"]))
				$cleanUrl .= $data["scheme"].":";

			$cleanUrl .= "//";

			if(!empty($data["user"]))
				$cleanUrl .= $data["user"];

			if(!empty($data["pass"]))
				$cleanUrl .= ":".$data["pass"];

			if(!empty($data["user"]) || !empty($data["pass"]))
				$cleanUrl .= "@";

			$cleanUrl .= $data["host"];	
			
			if(!empty($data["port"]))
				$cleanUrl .= ":".$data["port"];	

			if(!empty($data["path"]))
				$cleanUrl .= $data["path"];

			$extra = "";

			if(!empty($data["query"]))
				$extra .= "?".$data["query"];

			if(!empty($data["fragment"]))
				$extra .= "#".$data["fragment"];		


			$root = get_theme_root();
			$rootUrl = get_theme_root_uri();

			$lessFilePath = str_replace($rootUrl, $root, $cleanUrl);
			$lessFilePathBaseUrl = dirname($cleanUrl);
			$lessFilePathBase = str_replace($rootUrl, $root, $lessFilePathBaseUrl);

			$filename = explode(".", basename($lessFilePath));
			$extension = array_pop($filename);
			$filename = implode(".", $filename);

			$targetFileName = $filename.".lessc.css";
			$targetFilePath = $lessFilePathBase."/".$targetFileName;
			$targetFileURI = str_replace($root, $rootUrl, $targetFilePath) . $extra;

			$lastModifiedTime = file_absolute_mtime($lessFilePath);

			if(!file_exists($targetFilePath) || filemtime($targetFilePath) != $lastModifiedTime) {
				try{
				    $parser = new Less_Parser();
					$parser->parseFile( $lessFilePath, str_replace( array("http:", "https:"), "", $lessFilePathBaseUrl) );
					$css = $parser->getCss();
					
					$bytes = file_put_contents($targetFilePath, $css);
					if($bytes === false) {
						$compiled = false;
					} else {
						touch($targetFilePath, $lastModifiedTime);
						$compiled = $targetFileURI;
					}
				} catch(Exception $e) {
					$compiled = false;
					if(file_exists($targetFilePath)) {
						unlink($targetFilePath);
					}
				}
			} else {
				$compiled = $targetFileURI;
			}
		}

		if($compiled !== false) {
			$tag = str_replace($url, $compiled, $tag);
		} else {
			$tag = str_replace(array("rel='stylesheet'", 'rel="stylesheet"'), "rel='stylesheet/less'", $tag);
			add_action( "wp_head", "SLESS_add_script", 100);
		}		
	}
	return $tag;
});

?>