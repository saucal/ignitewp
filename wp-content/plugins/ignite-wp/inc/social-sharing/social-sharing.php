<?php
add_ignite_support( 'ajax-request' );

ignite_register_script( 'social-sharing', 'js/social-sharing.js', array( 'jquery' ), '1.0', false, 5 );

require_once( 'inc/SocialCount.php' );

function get_post_social_counts( $post_id ) {
	$post_share_count = array();
	if ( ! empty( $post_id ) ) {
		$post_id = intval( $post_id );
		if ( $post_id > 0 ) {
			if ( false === ( $post_share_count = get_transient( 'post_' . $post_id . '_share_count' ) ) ) {
				ob_start();
				$_GET['url'] = get_permalink( $post_id );
				if ( ! SocialCount::REQUIRE_LOCAL_URL || SocialCount::isLocalUrl( $_GET['url'] ) ) {
					try {
						$social = new SocialCount( $_GET['url'] );

						$social->addNetwork( new Twitter() );
						$social->addNetwork( new Facebook() );
						$social->addNetwork( new GooglePlus() );
						$social->addNetwork( new LinkedIn() );
						// $social->addNetwork(new ShareThis());

						$data = json_decode( $social->toJSON(), true );

						$totalShares = 0;
						foreach ( $data as $network => &$count ) {
							$count = intval( $count );
							update_post_meta( $post_id, 'social_shares_' . $network, $count );
							$totalShares += $count;
						}
						//var_dump($data);
						update_post_meta( $post_id, 'social_shares', $totalShares );

						$post_share_count = $data;
					} catch ( Exception $e ) {
						$post_share_count = array(
							'error' => $e->getMessage(),
						);
					}
				} else {
					$post_share_count = array(
						'error' => 'URL not authorized (' . $_SERVER['HTTP_HOST'] . ')',
					);
				}
				set_transient( 'post_' . $post_id . '_share_count', $post_share_count, 5 * MINUTE_IN_SECONDS );
			}
		}
	}
	return $post_share_count;
}

function get_post_socials_ajax() {
	if ( isset( $_REQUEST['post_id'] ) ) {
		$post_id = $_REQUEST['post_id'];
	} elseif ( isset( $_REQUEST['post_url'] ) ) {
		$post_id = url_to_postid( $_REQUEST['post_url'] );
	} else {
		$post_id = url_to_postid( wp_get_referer() );
	}

	$data = get_post_social_counts( $post_id );
	echo json_encode( $data );
	die();
}

add_action( 'wp_ajax_social-count', 'get_post_socials_ajax' );
add_action( 'wp_ajax_nopriv_social-count', 'get_post_socials_ajax' );

add_filter(
	'posts_clauses',
	function( $clauses, $wpq ) {
		//$clauses["orderby"]
		$orderby = $wpq->get( 'orderby' );
		if ( $orderby == 'popularity' ) {
			$order = $wpq->get( 'order' );
			if ( empty( $order ) ) {
				$order = 'DESC';
			}
			global $wpdb;
			$clauses['join'] .= " LEFT JOIN {$wpdb->postmeta} as share_count ON share_count.meta_key = 'social_shares' AND {$wpdb->posts}.ID = share_count.post_id";
			$clauses['orderby'] = "(share_count.meta_value+0)/(DATEDIFF(CURDATE(), {$wpdb->posts}.post_date_gmt)+1) {$order}, {$wpdb->posts}.post_date_gmt DESC";
		}
		return $clauses;
	},
	10,
	2
);


