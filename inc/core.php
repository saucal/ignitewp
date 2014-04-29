<?php 
//Load all the libraries in the directory
if ($handle = opendir(SAUCAL_TPL_INCL)) {
	$dirsToHandle = array();
    while (false !== ($file = readdir($handle))) {
        if ('.' === $file) continue;
        if ('..' === $file) continue;
        $fullPath = SAUCAL_TPL_INCL.$file;

        if(is_dir($fullPath)){
        	$dirsToHandle[] = $file;
        	continue;
        }
        if ('core.php' === $file) continue;

        if(is_file($fullPath) && strpos($file, ".php") !== false)
        	require_once($fullPath);
    }
    closedir($handle);

	//Handle libs in a subdirectory
    if(!empty($dirsToHandle)){
    	foreach ($dirsToHandle as $dirname) {
    		$fullPath = SAUCAL_TPL_INCL.$dirname."/";
    		$pathToTry = array(
    			$fullPath.$dirname.".php",
    			$fullPath."index.php"
    		);

    		foreach($pathToTry as $path){
    			if(file_exists($path)){
    				require_once($path);
    				break;
    			}
    		}
    	}
    }
}

function SAUCAL_TPL_LIB_DIR($file) {
	return realpath(dirname($file));
}
function SAUCAL_TPL_LIB_URL($file) {
	$path = SAUCAL_TPL_LIB_DIR($file);
	$themeLibBase = realpath(SAUCAL_TPL_INCL);
	return SAUCAL_TPL_BASEURL."/inc".str_replace(array($themeLibBase, "\\"), array("", "/"), $path);
}

?>