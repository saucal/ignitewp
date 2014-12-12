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

			$check = md5(file_get_contents($lessFilePath));
			$targetFileName = $filename."-".$check.".css";
			$targetFilePath = $lessFilePathBase."/".$targetFileName;
			$targetFileURI = str_replace($root, $rootUrl, $targetFilePath) . $extra;

			if(!file_exists($targetFilePath)) {
				try{
				    $parser = new Less_Parser();
					$parser->parseFile( $lessFilePath, $lessFilePathBaseUrl );
					$css = $parser->getCss();
					
					$bytes = file_put_contents($targetFilePath, $css);
					if($bytes === false) {
						$compiled = false;
					} else {
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