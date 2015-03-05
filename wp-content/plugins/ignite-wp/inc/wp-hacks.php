<?php 
//Undo autop around shortcodes.
add_filter('the_content', function($content) {   
    $array = array (
        '<p>[' => '[', 
        ']</p>' => ']', 
        ']<br />' => ']'
    );

    $content = strtr($content, $array);

    return $content;
});
?>