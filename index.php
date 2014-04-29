<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title><?php wp_title(); ?></title>
        <meta name="viewport" content="width=device-width">

        <link rel="stylesheet" href="<?= SAUCAL_TPL_BASEURL ?>/css/vendor/bootstrap.min.css">

        <?php wp_head(); ?>

        <script src="<?= SAUCAL_TPL_BASEURL ?>/js/vendor/bootstrap.min.js"></script>
        <script src="<?= SAUCAL_TPL_BASEURL ?>/js/inc/bootstrap-responsive-extension.js"></script>
        <script src="<?= SAUCAL_TPL_BASEURL ?>/js/vendor/modernizr-2.6.2-respond-1.1.0.min.js"></script>

        <link href='http://fonts.googleapis.com/css?family=Montserrat:400,700|Roboto:400,100,100italic,300,300italic,400italic,500,500italic,700,700italic,900,900italic' rel='stylesheet' type='text/css'>

        <link rel="stylesheet" href="<?= SAUCAL_TPL_BASEURL ?>/css/vendor/normalize.css">
        <link rel="stylesheet" href="<?= SAUCAL_TPL_BASEURL ?>/css/vendor/bootstrap-responsive.min.css">
        <link rel="stylesheet" href="<?= SAUCAL_TPL_BASEURL ?>/css/inc/bootstrap-responsive-extension.css">
    </head>
    <body>
        <p>Hello world! This is HTML5 Boilerplate.</p>
        <?php wp_footer(); ?>
    </body>
</html>
