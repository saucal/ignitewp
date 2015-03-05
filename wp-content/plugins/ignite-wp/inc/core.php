<?php 
function add_ignite_support($modules) {
    if(!is_array($modules))
        $modules = array($modules);

    foreach($modules as $module) {
        if(current_theme_supports( "ignite-".$module ))
            continue;

        $fullPath = IGNITE_INCL.$module;

        if(!file_exists($fullPath) && !file_exists($fullPath.".php"))
            continue;

        if(is_dir($fullPath)) {
            $fullPath = $fullPath."/";
            $pathToTry = array(
                $fullPath.$module.".php",
                $fullPath."index.php"
            );
            $found = false;
            foreach($pathToTry as $path){
                if(file_exists($path)){
                    $fullPath = $path;
                    $found = true;
                    break;
                }
            }

            if(!$found)
                continue;
        } else if(is_file($fullPath.".php")) {
            $fullPath = $fullPath.".php";
        } else {
            continue;
        }
        
        add_theme_support("ignite-".$module);
        require_once($fullPath);
    }
}

function SAUCAL_TPL_LIB_DIR($file) {
	return realpath(dirname($file));
}
function SAUCAL_TPL_LIB_URL($file) {
	$path = SAUCAL_TPL_LIB_DIR($file);
	$themeLibBase = realpath(IGNITE_INCL);
	return IGNITE_BASE_URL."/inc".str_replace(array($themeLibBase, "\\"), array("", "/"), $path);
}

?>