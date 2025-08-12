<?php

/**
 * Main plugin class for EM Carousel.
 * PHP version 7.3+
 *
 * @category Wordpress_Plugin
 * @package  Esmond-M
 * @author   Esmond Mccain <esmondmccain@gmail.com>
 * @license  https://www.gnu.org/licenses/gpl-3.0.en.html GNU General Public License
 * @link     esmondmccain.com
 */

declare(strict_types=1);
namespace emBlockCarousel;

class emBlockCarousel
{
    /**
     * Constructor: sets up hooks.
     */
    public function __construct()
    {
      //  add_action('init', [$this, '']);
          add_action('init', [$this, 'em_block_carousel_init']);
    }

    /**
     * Server-side render for Latest Posts Carousel
    */
    public function em_block_carousel_content($attributes)
    {
      $atts = wp_parse_args(
        $attributes ?? [],
        [
          'sectionTitle' => 'Latest Posts',
          'postsToShow'  => 9,
          'categories'   => [],
          'showExcerpt'  => true,
          'postType'     => 'post',
          'order'        => 'desc',
          'orderBy'      => 'date',
        ]
      );

      $q_args = [
        'post_type'           => $atts['postType'],
        'posts_per_page'      => max(1, (int) $atts['postsToShow']),
        'ignore_sticky_posts' => true,
        'orderby'             => sanitize_key( $atts['orderBy'] ),
        'order'               => strtoupper( $atts['order'] ) === 'ASC' ? 'ASC' : 'DESC',
      ];

      if ( ! empty( $atts['categories'] ) && $atts['postType'] === 'post' ) {
        $q_args['category__in'] = array_map( 'intval', (array) $atts['categories'] );
      }

      $q = new WP_Query( $q_args );

      ob_start(); ?>

      <?php if ( $q->have_posts() ) : ?>
      <section class="carousel wp-block-em-latest-posts-carousel" role="region" aria-roledescription="carousel" aria-label="<?php echo esc_attr( $atts['sectionTitle'] ); ?>">
        <div class="carousel__header">
          <h2 class="carousel__title"><?php echo esc_html( $atts['sectionTitle'] ); ?></h2>
          <div class="carousel__controls" aria-controls="<?php echo esc_attr( $block->context['postId'] ?? 'posts-track' ); ?>">
            <button class="carousel__btn" data-carousel-prev aria-label="<?php esc_attr_e('Previous slide'); ?>">‹</button>
            <button class="carousel__btn" data-carousel-next aria-label="<?php esc_attr_e('Next slide'); ?>">›</button>
          </div>
        </div>

        <div class="carousel__viewport">
          <ul class="carousel__track" tabindex="0">
            <?php while ( $q->have_posts() ) : $q->the_post(); ?>
              <li class="carousel__slide">
                <article <?php post_class('card'); ?>>
                  <a class="card__media" href="<?php the_permalink(); ?>">
                    <?php if ( has_post_thumbnail() ) {
                      the_post_thumbnail( 'large', [ 'loading' => 'lazy' ] );
                    } ?>
                  </a>
                  <div class="card__body">
                    <h3 class="card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
                    <p class="card__meta"><?php echo esc_html( get_the_date() ); ?></p>
                    <?php if ( ! empty( $atts['showExcerpt'] ) ) : ?>
                      <p class="card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 20, '…' ) ); ?></p>
                    <?php endif; ?>
                    <a class="btn btn--primary" href="<?php the_permalink(); ?>"><?php esc_html_e('Read more'); ?></a>
                  </div>
                </article>
              </li>
            <?php endwhile; wp_reset_postdata(); ?>
          </ul>
        </div>

        <div class="carousel__dots" data-carousel-dots></div>
      </section>
      <?php endif; ?>

      <?php
      echo ob_get_clean();
    }
     
    /**
     * Registers the block using the metadata loaded from the `block.json` file.
     */
    public function em_block_carousel_init()
    {
        register_block_type(
            WP_PLUGIN_DIR . '/em-block-carousel/build',
            [
                'render_callback' => [$this, 'em_block_carousel_content']
            ]
        );
    }

     
}