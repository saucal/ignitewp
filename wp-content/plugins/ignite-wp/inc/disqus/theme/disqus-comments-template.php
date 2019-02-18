<?php
if ( DISQUS_DEBUG ) {
	echo '<p><strong>Disqus Debug</strong> thread_id: ' . get_post_meta( $post->ID, 'dsq_thread_id', true ) . '</p>';
}

$thread_ID = 'post_' . get_the_id();

?>

<div id="disqus_thread_<?php echo $thread_ID; ?>" class="disqus_thread" data-thread-id="<?php echo $thread_ID; ?>">
	<?php if ( ! get_option( 'disqus_disable_ssr' ) && have_comments() && is_singular() ) : ?>
		<?php
		// if (is_file(TEMPLATEPATH . '/comments.php')) {
		//     include(TEMPLATEPATH . '/comments.php');
		// }
		?>
		<div id="dsq-content">

		<?php if ( get_comment_pages_count() > 1 && get_option( 'page_comments' ) ) : // Are there comments to navigate through? ?>
			<div class="navigation">
				<div class="nav-previous"><?php previous_comments_link( dsq_i( '<span class="meta-nav">&larr;</span> Older Comments' ) ); ?></div>
				<div class="nav-next"><?php next_comments_link( dsq_i( 'Newer Comments <span class="meta-nav">&rarr;</span>' ) ); ?></div>
			</div> <!-- .navigation -->
		<?php endif; // check for comment navigation ?>

			<ul id="dsq-comments">
				<?php
					/* Loop through and list the comments. Tell wp_list_comments()
					 * to use dsq_comment() to format the comments.
					 */
					wp_list_comments(
						array(
							'callback' => 'dsq_comment',
						)
					);
				?>
			</ul>

		<?php if ( get_comment_pages_count() > 1 && get_option( 'page_comments' ) ) : // Are there comments to navigate through? ?>
			<div class="navigation">
				<div class="nav-previous"><?php previous_comments_link( dsq_i( '<span class="meta-nav">&larr;</span> Older Comments' ) ); ?></div>
				<div class="nav-next"><?php next_comments_link( dsq_i( 'Newer Comments <span class="meta-nav">&rarr;</span>' ) ); ?></div>
			</div><!-- .navigation -->
		<?php endif; // check for comment navigation ?>

		</div>

	<?php endif; ?>
</div>

<?php if ( apply_filters( 'ignite-disqus-lazy', false ) ) : ?>
<div class="lazy-load-disqus"><a href="#" data-thread-id="<?php echo $thread_ID; ?>"><?php echo apply_filters( 'ignite-disqus-lazy-button-text', '<span>Lazy Comments</span>' ); ?></a></div>
<?php endif; ?>

<script type="text/javascript">
/* <![CDATA[ */
	disqus_configs["<?php echo $thread_ID; ?>"] = {
		page: {
			url: '<?php echo get_permalink(); ?>',
			identifier: '<?php echo dsq_identifier_for_post( $post ); ?>',
			title: <?php echo cf_json_encode( dsq_title_for_post( $post ) ); ?>
		},
		wp_post_id: '<?php echo $post->ID; ?>'
	}
	<?php
	$sso = dsq_sso();
	if ( $sso ) {
		foreach ( $sso as $k => $v ) {
			echo "disqus_configs[\"<?php echo $thread_ID; ?>\"].page.{$k} = '{$v}';\n";
		}
		echo "disqus_configs[\"<?php echo $thread_ID; ?>\"]." . dsq_sso_login();
	}
	?>
	current_disqus_config = "<?php echo $thread_ID; ?>";

	<?php if ( false && get_option( 'disqus_developer' ) ) : ?>
		var disqus_developer = 1;
	<?php endif; ?>
/* ]]> */
</script>

<script type="text/javascript">
/* <![CDATA[ */
	var DsqLocal = {
		'trackbacks': [
<?php
	$count = 0;
foreach ( $comments as $comment ) {
	$comment_type = get_comment_type();
	if ( $comment_type != 'comment' ) {
		if ( $count ) {
			echo ','; }
		?>
		{
			'author_name':    <?php echo cf_json_encode( get_comment_author() ); ?>,
			'author_url':    <?php echo cf_json_encode( get_comment_author_url() ); ?>,
			'date':            <?php echo cf_json_encode( get_comment_date( 'm/d/Y h:i A' ) ); ?>,
			'excerpt':        <?php echo cf_json_encode( str_replace( array( "\r\n", "\n", "\r" ), '<br />', get_comment_excerpt() ) ); ?>,
			'type':            <?php echo cf_json_encode( $comment_type ); ?>
		}
		<?php
		$count++;
	}
}
?>
		],
		'trackback_url': <?php echo cf_json_encode( get_trackback_url() ); ?>
	};
/* ]]> */
</script>

<script type="text/javascript">
/* <![CDATA[ */
(function() {
	initializeDisqusComments();
})();
/* ]]> */
</script>
