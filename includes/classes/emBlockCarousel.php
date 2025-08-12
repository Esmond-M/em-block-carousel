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
    add_action('init', [$this, 'em_block_carousel_init']);
    // Removed global enqueue_block_assets hook
  }

  private function enqueue_assets()
  {
    $plugin_url = plugin_dir_url(dirname(__DIR__, 2) . '/em-block-carousel.php');
    // Slick CSS
    wp_enqueue_style(
      'em-block-carousel-slick',
      $plugin_url . 'assets/css/slick.css',
      [],
      '1.8.1'
    );
    // Carousel block custom CSS (optional, if you have one)
    if (file_exists(dirname(__DIR__, 2) . '/assets/css/carousel-custom.css')) {
      wp_enqueue_style(
        'em-block-carousel-custom',
        $plugin_url . 'assets/css/carousel-custom.css',
        ['em-block-carousel-slick'],
        null
      );
    }
    // Slick JS
    wp_enqueue_script(
      'em-block-carousel-slick',
      $plugin_url . 'assets/js/slick.min.js',
      ['jquery'],
      '1.8.1',
      true
    );
    // Custom initialization JS
    wp_enqueue_script(
      'em-block-carousel-init',
      $plugin_url . 'assets/js/carousel-init.js',
      ['jquery', 'em-block-carousel-slick'],
      null,
      true
    );
  }

    /**
     * Server-side render for Latest Posts Carousel
    */
    public function em_block_carousel_content($attributes)
    {
      // Only enqueue assets when block is rendered on frontend
      if (!is_admin()) {
        $this->enqueue_assets();
      }

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

        $q = new \WP_Query( $q_args );

      ob_start(); ?>

      <?php if ( $q->have_posts() ) : ?>
      <section class="em-slick-carousel wp-block-em-latest-posts-carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label="<?php echo esc_attr( $atts['sectionTitle'] ); ?>"
  style="<?php echo isset($atts['maxWidth']) ? 'max-width:' . esc_attr($atts['maxWidth']) . 'px;' : ''; ?>"
      >
        <div class="carousel__header">
          <h2 class="carousel__title"><?php echo esc_html( $atts['sectionTitle'] ); ?></h2>
        </div>

        <div class="carousel__viewport">
          <div class="em-slick-track">
            <?php while ( $q->have_posts() ) : $q->the_post(); ?>
              <div class="em-slick-slide">
                <article <?php post_class('card'); ?> >
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
              </div>
            <?php endwhile; wp_reset_postdata(); ?>
          </div>
        </div>
        <div class="em-slick-dots"></div>
      </section>
      <?php endif; ?>

      <?php
      return ob_get_clean();
    }
     
    /**
     * Registers the block using the metadata loaded from the `block.json` file.
     */
    public function em_block_carousel_init()
    {

      error_log('em_block_carousel_init ran');
        register_block_type(
            dirname(__DIR__, 2) . '/build',
            [
                'render_callback' => [$this, 'em_block_carousel_content']
            ]
        );
    }

     
}