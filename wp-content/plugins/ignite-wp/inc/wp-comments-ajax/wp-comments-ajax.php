<?php
class Saucal_WP_Commenting {
	function __construct() {
		add_filter( 'comment_form_defaults', array( $this, 'comment_form_defaults' ) );
		add_action( 'comment_form_before_fields', array( $this, 'comment_form_before_fields' ) );
		add_action( 'comment_form_after_fields', array( $this, 'comment_form_after_fields' ) );
		add_action( 'comments_template', array( $this, 'comments_template' ) );
		add_filter( 'wp_list_comments_args', array( $this, 'wp_list_comments_args' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'wp_enqueue_scripts' ) );
		add_action( 'init', array( $this, 'init' ) );

		// ajax commenting

		add_filter( 'comment_post_redirect', array( $this, 'comment_post_redirect' ), 10, 2 );
		add_action( 'wp_ajax_nopriv_' . 'get_comments', array( $this, 'comments_for_post' ) );
		add_action( 'wp_ajax_' . 'get_comments', array( $this, 'comments_for_post' ) );
	}
	function init() {
		wp_register_script( SAUCAL_TPL_ID . '-comments', SAUCAL_TPL_LIB_URL( __FILE__ ) . '/js/comments.js', array( 'jquery' ), '1.0', false );
	}
	function wp_enqueue_scripts() {
		wp_enqueue_script( SAUCAL_TPL_ID . '-comments' );
		wp_enqueue_script( 'comment-reply' );
	}
	function wp_list_comments_args( $defaults ) {
		$defaults['walker'] = new Saucal_Walker_Comment();
		return $defaults;
	}
	function comment_form_defaults( $defaults ) {
		$user = wp_get_current_user();
		$user_identity = $user->exists() ? $user->display_name : '';

		$req      = get_option( 'require_name_email' );
		$aria_req = ( $req ? " aria-required='true'" : '' );
		$html_req = ( $req ? " required='required'" : '' );

		$commenter = wp_get_current_commenter();

		$fields   = array(
			'author' => '<p class="comment-form-author">' . '<label for="author">' . __( 'Your Name' ) . ( $req ? ' <span class="required">*</span>' : '' ) . '</label> ' .
						'<input id="author" name="author" type="text" placeholder="Enter Name" value="' . esc_attr( $commenter['comment_author'] ) . '" size="30"' . $aria_req . $html_req . ' /></p>',
			'email'  => '<p class="comment-form-email"><label for="email">' . __( 'Email Address' ) . ( $req ? ' <span class="required">*</span>' : '' ) . '</label> ' .
						'<input id="email" name="email" type="text" placeholder="name@example.com" value="' . esc_attr( $commenter['comment_author_email'] ) . '" size="30" aria-describedby="email-notes"' . $aria_req . $html_req . ' /></p>',
			'url'    => '<p class="comment-form-url"><label for="url">' . __( 'Website URL' ) . '</label> ' .
						'<input id="url" name="url" type="text" placeholder="http://" value="' . esc_attr( $commenter['comment_author_url'] ) . '" size="30" /></p>',
		);

		$defaults = array_merge(
			$defaults,
			array(
				'fields' => $fields,
				'title_reply' => 'Join The Conversation',
				'must_log_in' => '',
				'comment_field' => '<p class="comment-form-comment"><label for="comment">' . _x( 'Your Message', 'noun' ) . '</label><textarea placeholder="Write Here ..." id="comment" name="comment" cols="45" rows="8" aria-required="true"></textarea></p>',
				'comment_notes_after' => '',
				'comment_notes_before' => '',
			)
		);
		return $defaults;
	}
	function comment_form_before_fields() {
		?>
		<div class="comments-reply-fields">
		<?php
	}
	function comment_form_after_fields() {
		?>
		</div>
		<?php
	}
	function comments_template( $location ) {
		if ( $_REQUEST['action'] == 'get_comments' ) {
			return STYLESHEETPATH . '/comments-layout.php';
		}
		return $location;
	}

	// ajax commenting

	function comment_post_redirect( $location, $comment ) {
		/* AJAX check  */
		if ( ! empty( $_SERVER['HTTP_X_REQUESTED_WITH'] ) && strtolower( $_SERVER['HTTP_X_REQUESTED_WITH'] ) == 'xmlhttprequest' ) {
			return add_query_arg(
				array(
					'action' => 'get_comments',
					'post' => $comment->comment_post_ID,
				),
				admin_url( 'admin-ajax.php' )
			);
		}
		return $location;
	}

	function comments_for_post() {
		global $post;
		$post = get_post( $_GET['post'] );
		setup_postdata( $post );
		echo '<div>';
		global $withcomments;
		$withcomments = true;
		comments_template();
		echo '</div>';
		exit;
	}
}

$instance = new Saucal_WP_Commenting();

// Comment Print

class Saucal_Walker_Comment extends Walker_Comment {
	protected function comment( $comment, $depth, $args ) {
		$this->saucal_comment( $comment, $depth, $args );
	}
	protected function html5_comment( $comment, $depth, $args ) {
		$this->saucal_comment( $comment, $depth, $args );
	}
	protected function saucal_comment( $comment, $depth, $args ) {
		if ( 'div' == $args['style'] ) {
			$tag = 'div';
			$add_below = 'comment';
		} else {
			$tag = 'li';
			$add_below = 'div-comment';
		}
		?>
		<<?php echo $tag; ?> <?php comment_class( $this->has_children ? 'parent' : '' ); ?> id="comment-<?php comment_ID(); ?>">
		<?php if ( 'div' != $args['style'] ) : ?>
		<div id="div-comment-<?php comment_ID(); ?>" class="comment-body">
		<?php endif; ?>
		<div class="avatar_pos">
			<?php
			if ( 0 != $args['avatar_size'] ) {
				echo get_avatar( $comment, $args['avatar_size'] );}
			?>
		</div>
		<div class="comment-author vcard">
			<?php printf( __( '<cite class="fn">%s</cite> <span class="says">says:</span>' ), get_comment_author_link() ); ?>
		</div>
		<?php if ( '0' == $comment->comment_approved ) : ?>
		<em class="comment-awaiting-moderation"><?php _e( 'Your comment is awaiting moderation.' ); ?></em>
		<br />
		<?php endif; ?>

		<?php
		comment_text(
			get_comment_id(),
			array_merge(
				$args,
				array(
					'add_below' => $add_below,
					'depth' => $depth,
					'max_depth' => $args['max_depth'],
				)
			)
		);
		?>

		<div class="comment-meta commentmetadata">
			<a href="<?php echo esc_url( get_comment_link( $comment->comment_ID, $args ) ); ?>" class="comment-direct-link">
				<?php printf( __( '%1$s at %2$s' ), get_comment_date(), get_comment_time() ); ?>
			</a>
			<span class="btns">
				<?php
				comment_reply_link(
					array_merge(
						$args,
						array(
							'add_below' => $add_below,
							'depth'     => $depth,
							'max_depth' => $args['max_depth'],
							'before'    => '',
							'after'     => '',
						)
					)
				);
				?>
				<?php edit_comment_link( __( 'Edit' ), '', '' ); ?>
			</span>
		</div>

		<?php if ( 'div' != $args['style'] ) : ?>
		</div>
		<?php endif; ?>
		<?php
	}
}
?>
