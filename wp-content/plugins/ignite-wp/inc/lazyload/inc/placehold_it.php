<?php

/**
 *  Simple class to create "inline" spacer PNG images which could be used as placeholders in websites
 *  The class stores the generated images in cache for performance
 *  Inspired by: http://placehold.it/
 *  Author: paha77, paha77@gmail.com
 */
class Placehold_it {
    
    protected $cache_dir; // the cache dir
    
    /**
     *  Constructor function.  An optional array could be passed as options
     */
    public function __construct($options=array()) {
        
        // if there's no cache_dir given or the given cache dir could not be created the class uses system temp dir
        if (!$options['cache_dir'] || (!is_dir($options['cache_dir']) && !mkdir($options['cache_dir'], 0770, TRUE))) {
            $this->cache_dir = sys_get_temp_dir();
        } else {
            $this->cache_dir = $options['cache_dir'];
        }

        // add a / to the cache dir path        
        if (mb_substr($this->cache_dir, -1) != '/') {
            $this->cache_dir .= '/';
        }
    }

    /**
     *  Get a placeholder image for the specified width and height
     *  @param  int $width  Width of the generated image
     *  @param  int $height  Height of the generated image
     *  @return string  The Base64-encoded image
     */
    public function get($width=1, $height=1) {
        // check if the image is already generated
        $file = $this->cache_dir . 'placehold_it_' . $width . '_' . $height . '_' . md5($width . '_' . $height) . '.base64';
        // if the image is not generated, call the generate function and then save it in the cache
        if (!file_exists($file)) {
            $content = $this->generate($width, $height);
            file_put_contents($file, $content);
            return $content;
        }
        
        return file_get_contents($file);
    }
    
    /**
     *  Generate a transparent PNG with the given with and height and return it as a string in a Data-URI format
     *  @param  int $width  Width of the generated image
     *  @param  int $height  Height of the generated image
     *  @see    http://en.wikipedia.org/wiki/Data_URI_scheme
     *  @return string  The Base64-encoded image
     */
    protected function generate($width=1, $height=1) {
        // safety checks
        if (!$width) {
            $width = 1;
        }
        if (!$height) {
            $height = 1;
        }
        
        // creating the PNG
        $img = imagecreatetruecolor($width, $height);
        imagesavealpha($img, true);
        $color = imagecolorallocatealpha($img, 0, 0, 0, 127);
        imagefill($img, 0, 0, $color);

        // instead of displaying the image in the browser we catch the output into a string
        ob_start();
        imagepng($img);
        $image_data = ob_get_contents();
        ob_end_clean();        
        
        // cleanup
        imagecolordeallocate($img, $color);
        imagedestroy($img);
        
        // base64
        return 'data:image/png;base64,' . base64_encode($image_data);
    }
}