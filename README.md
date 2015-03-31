IgniteWP
=========

A WordPress Theme Framework developed by Saucal Inc.

Why would it help me?
----------------------

It will speed up the time you spend doing those repetitive tasks when building themes for WP. You just need to add the modules you need to the inc folder, and it will autoload all the plugins that will make your life easier.

What's the philosophy behind it?
---------------------------------

We love WordPress, and we love building stuff using it. But we also love to get right to the creation part, we don't want to spend a couple of hours setting up everything we are going to be using, we love "plug and play" solutions. And since some times we don't find those, we build a module for this.

Which modules do we include?
-----------------------------

### AJAX API
This module will help you implement quickly an AJAX browseable page. 

### AJAX Request
This module will quickly let you work with ajax calls to the admin-ajax.php script using some great JS shorthands. Just get to the point of the calls, don't spend time setting them up.

### Bootstrap 2 (Modded)
In the past we've needed to work with a grid that was flexible as the one in Foundation, but keeping all the good features in bootstrap. That's why we ended up moddin bootstrap grid to work like the Foundation one in responsive. 

**This is likely to be removed eventually, so consider it deprecated.**

### Bootstrap 3
Along came bootstrap 3, and it has already all the features we needed from Bootstrap 2, so we updated it.

### Bootstrap 3 Mods
We've implemented a few JS shorthands here that help us get right to work. It's just a couple functions that will let you easily work with tooltips dinamically from JS, and help you build forms with the Bootstrap structure, right from JS too.

### DISQUS
This module will let you easily integrate disqus comments in your site. You would need to install the [DISQUS plugin](https://wordpress.org/plugins/disqus-comment-system/) for this to work tho.

### JS Layout Builders
This is just a couple functions that you'll probably need to rapidly prototype layouts with JS. They'll help you build new elements on the fly as jQuery elements.

### LESS
This will save you lots of time of work when writing CSS using less syntax. It will compile less code automatically, so you would just focus on writing the actual stylesheet.

### Modernizr
This module will include Modernizr in your theme, if you need to use it for some reason.

### Scrollbars
It will let you stylize scrollbars really easy, with just the use of a class in the element you want to have stylized scrollbars. It makes use of the awesome [Perfect Scrollbars](https://github.com/noraesae/perfect-scrollbar), plus some mods on the house to minify the settings needed to get this up and running.

### UI Shortcodes
This module containes the widely adopted shortcodes to build 2 column or 3 columns pages. It will define one-half, one-third, one-fourth, and all their derivates.

### IcoMoon
With this module enabled, you would just need to include the files you download from icomoon in a folder named icomoon in the root of the theme, and they'll get automatically loaded into the theme.

### Post Type
This is a single PHP function that will let you register post types in wordpress. No need to use several functions. You'll control the columns, the taxonomies, the meta boxes, etc.

### WP-Hacks
This contains a few fixes we had to do to WP over time, that we decided to include here because we ended up using it across all the projects we've worked on.

TO-DOs
======

* Right now this is a theme, but we may be switching it to a plugin in the near future, and including functionality in themes using the theme support funcionality in wordpress.
* Stylable dropdowns.
* Better meta boxes for the Post Type module (probably using the awesome [Advanced Custom Fields](https://github.com/elliotcondon/acf)).
* Any other suggestion we may be receiving from you

Development
===========

So far we've kept this private, but we decided to publish this so everyone is able to use it, and help us turn it into the framework that every WordPress theme developer wish to work with. 

Documentation
=============

This is one of our biggest flaws on this, but we intend to document it soon. We'll probably use the GitHub Wiki for it.

License
=======

The MIT License (MIT) Copyright (c) 2015 Saucal Studios.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

**It means, you can freely fork and modify this project for commercial or non-comercial use!**
