<?php 
global $moduleEnvUrl, $enqueueEnviroment;
$moduleEnvUrl = array();
$enqueueEnviroment = array();
function add_ignite_support($modules, $enviroment = NULL) {
    $data = ignite_get_current_enviroment();
    if(!isset($enviroment)){
        if(isset($data["enqueueEnviroment"]))
            $enviroment = $data["enqueueEnviroment"];
        else
            $enviroment = "front";
    }

    if(!is_array($modules))
        $modules = array($modules);

    foreach($modules as $module) {
        if(current_theme_supports( "ignite-".$module."-".$enviroment ))
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
        add_theme_support("ignite-".$module."-".$enviroment);

        global $moduleEnvUrl, $enqueueEnviroment;
        $moduleEnvUrl[] = SAUCAL_TPL_LIB_URL($fullPath);
        $enqueueEnviroment[] = $enviroment;

        require($fullPath);

        array_pop($moduleEnvUrl);
        array_pop($enqueueEnviroment);
    }
}

function ignite_get_current_enviroment(){
    global $moduleEnvUrl, $enqueueEnviroment;
    return array(
        "moduleEnvUrl" => count($moduleEnvUrl) ? end($moduleEnvUrl) : null,
        "enqueueEnviroment" => count($enqueueEnviroment) ? end($enqueueEnviroment) : null
    );
}

class Ignite_Scripts {
    var $scripts = array();
    function Ignite_Scripts() {
        $action = "wp";
        if(is_admin())
            $action = "admin_init";
        add_action($action, array($this, "initialize_registering"));
    }
    function register_script($script_id, $path, $deps = array(), $ver = false, $in_footer = false, $enqueue_at_priority = "no") {
        extract(ignite_get_current_enviroment());

        if(!isset($enqueueEnviroment))
            $enqueueEnviroment = "front";

        if(!isset($this->scripts[$enqueueEnviroment])) 
            $this->scripts[$enqueueEnviroment] = array();
        
        if(!isset($this->scripts[$enqueueEnviroment][$enqueue_at_priority])) 
            $this->scripts[$enqueueEnviroment][$enqueue_at_priority] = array();

        if(strpos($path, "//") === 0 || strpos($path, "http://") === 0 || strpos($path, "https://") === 0) {
            $urlPath = $path;
        } else {
            $urlPath = rtrim($moduleEnvUrl, "/")."/".$path;
        }

        $this->scripts[$enqueueEnviroment][$enqueue_at_priority][] = array($script_id, $urlPath, $deps, $ver, $in_footer);
    }
    function initialize_registering(){
        extract(ignite_get_current_enviroment());
        foreach($this->scripts as $env => $prios){
            foreach($prios as $prio => $scripts) {
                foreach($scripts as $script){
                    call_user_func_array("wp_register_script", $script);
                }
                if(is_numeric($prio)) {
                    $cbs = array();
                    switch ($env) {
                        case 'front':
                            $cbs[] = "wp_enqueue_scripts";
                            break;
                        case 'admin':
                            $cbs[] = "admin_enqueue_scripts";
                            break;
                        case 'both':
                            $cbs[] = "wp_enqueue_scripts";
                            $cbs[] = "admin_enqueue_scripts";
                            break;
                    }
                    foreach($cbs as $cb) {
                        add_action($cb, create_function("", "return IgniteScripts()->enqueue_list(".var_export($scripts, true).");"), $prio);
                    }
                }
            }
        }
    }
    function enqueue_list($list) {
        foreach($list as $script) {
            wp_enqueue_script($script[0]);
        }
    }
}
function ignite_register_script($script_id, $path, $deps = array(), $ver = false, $in_footer = false, $enqueue_at_priority = "no") {
    return IgniteScripts()->register_script($script_id, $path, $deps, $ver, $in_footer, $enqueue_at_priority);
}
function IgniteScripts(){
    static $instance;
    if(!isset($instance))
        $instance = new Ignite_Scripts();
    return $instance;
}
IgniteScripts();

class Ignite_Styles {
    var $scripts = array();
    function Ignite_Styles() {
        $action = "wp";
        if(is_admin())
            $action = "admin_init";
        add_action($action, array($this, "initialize_registering"));
    }
    function register_style($script_id, $path, $deps = array(), $ver = false, $media = "all", $enqueue_at_priority = "no") {
        extract(ignite_get_current_enviroment());

        if(!isset($enqueueEnviroment))
            $enqueueEnviroment = "front";

        if(!isset($this->scripts[$enqueueEnviroment])) 
            $this->scripts[$enqueueEnviroment] = array();
        
        if(!isset($this->scripts[$enqueueEnviroment][$enqueue_at_priority])) 
            $this->scripts[$enqueueEnviroment][$enqueue_at_priority] = array();

        if(strpos($path, "//") === 0 || strpos($path, "http://") === 0 || strpos($path, "https://") === 0) {
            $urlPath = $path;
        } else {
            $urlPath = rtrim($moduleEnvUrl, "/")."/".$path;
        }

        $this->scripts[$enqueueEnviroment][$enqueue_at_priority][] = array($script_id, $urlPath, $deps, $ver, $media);
    }
    function initialize_registering(){
        extract(ignite_get_current_enviroment());

        foreach($this->scripts as $env => $prios){
            foreach($prios as $prio => $scripts) {
                foreach($scripts as $script){
                    call_user_func_array("wp_register_style", $script);
                }
                if(is_numeric($prio)) {
                    $cbs = array();
                    switch ($env) {
                        case 'front':
                            $cbs[] = "wp_enqueue_scripts";
                            break;
                        case 'admin':
                            $cbs[] = "admin_enqueue_scripts";
                            break;
                        case 'both':
                            $cbs[] = "wp_enqueue_scripts";
                            $cbs[] = "admin_enqueue_scripts";
                            break;
                    }
                    foreach($cbs as $cb) {
                        add_action($cb, create_function("", "return IgniteStyles()->enqueue_list(".var_export($scripts, true).");"), $prio);
                    }
                }
            }
        }
    }
    function enqueue_list($list) {
        foreach($list as $script) {
            wp_enqueue_style($script[0]);
        }
    }
}
function ignite_register_style($script_id, $path, $deps = array(), $ver = false, $media = "all", $enqueue_at_priority = "no") {
    return IgniteStyles()->register_style($script_id, $path, $deps, $ver, $media, $enqueue_at_priority);
}
function IgniteStyles(){
    static $instance;
    if(!isset($instance))
        $instance = new Ignite_Styles();
    return $instance;
}
IgniteStyles();


function SAUCAL_TPL_LIB_DIR($file) {
	return realpath(dirname($file));
}
function SAUCAL_TPL_LIB_URL($file) {
	$path = SAUCAL_TPL_LIB_DIR($file);
	$themeLibBase = realpath(IGNITE_INCL);
	return IGNITE_BASE_URL."/inc".str_replace(array($themeLibBase, "\\"), array("", "/"), $path);
}

?>