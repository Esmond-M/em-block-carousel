
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ToggleControl, TextControl, SelectControl, Spinner, Notice, __experimentalNumberControl as NumberControl } from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
  const { sectionTitle, postsToShow, categories, showExcerpt, postType, order, orderBy, maxWidth } = attributes;

  // Fetch posts from WP data store
  const { posts, isResolving } = useSelect((select) => {
    const core = select('core');
    const query = {
      per_page: postsToShow,
      order,
      orderby: orderBy,
      categories,
      _embed: true,
    };
    return {
      isResolving: core.isResolving('getEntityRecords', ['postType', postType, query]),
      posts: core.getEntityRecords('postType', postType, query) || [],
    };
  }, [postsToShow, order, orderBy, categories, postType]);

  const blockProps = useBlockProps({
    className: 'em-slick-carousel is-editor',
    style: {
      maxWidth: maxWidth ? `${maxWidth}px` : undefined,
      margin: 'auto',
    },
  });

  React.useEffect(() => {
    if (window.jQuery && typeof window.jQuery.fn.slick === 'function') {
      setTimeout(() => {
        window.jQuery('.em-slick-carousel .em-slick-track').not('.slick-initialized').slick({
          dots: true,
          arrows: true,
          slidesToShow: 3,
          slidesToScroll: 1,
          adaptiveHeight: true,
          responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 600, settings: { slidesToShow: 1 } },
          ],
        });
      }, 200);
    }
  });

  return (
    <>
      <InspectorControls>
        <PanelBody title={__('Content', 'em')} initialOpen>
          <TextControl
            label={__('Section title', 'em')}
            value={sectionTitle}
            onChange={(v) => setAttributes({ sectionTitle: v })}
          />
          <RangeControl
            label={__('Posts to show', 'em')}
            min={1}
            max={24}
            value={postsToShow}
            onChange={(v) => setAttributes({ postsToShow: v })}
          />
          <ToggleControl
            label={__('Show excerpt', 'em')}
            checked={showExcerpt}
            onChange={(v) => setAttributes({ showExcerpt: v })}
          />
          <SelectControl
            label={__('Order by', 'em')}
            value={orderBy}
            options={[
              { label: 'Date', value: 'date' },
              { label: 'Title', value: 'title' },
            ]}
            onChange={(v) => setAttributes({ orderBy: v })}
          />
          <SelectControl
            label={__('Order', 'em')}
            value={order}
            options={[
              { label: 'DESC', value: 'desc' },
              { label: 'ASC', value: 'asc' },
            ]}
            onChange={(v) => setAttributes({ order: v })}
          />
          <NumberControl
            label={__('Max Width (px)', 'em')}
            value={maxWidth}
            min={400}
            max={2400}
            onChange={(v) => setAttributes({ maxWidth: Number(v) })}
            help={__('Set the maximum width of the carousel container.', 'em')}
          />
        </PanelBody>
      </InspectorControls>

      <section {...blockProps}>
        <div className="carousel__header">
          <h2 className="carousel__title">{sectionTitle || __('Latest Posts', 'em')}</h2>
        </div>
        <div className="carousel__viewport">
          <div className="em-slick-track" style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
            {isResolving && <Spinner />}
            {!isResolving && posts.length === 0 && (
              <Notice status="warning" isDismissible={false}>{__('No posts found.', 'em')}</Notice>
            )}
            {!isResolving && posts.map((post) => {
              const featuredImg = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
              return (
                <div className="em-slick-slide" key={post.id}>
                  <article className="card">
                    <a className="card__media" href={post.link} target="_blank" rel="noopener noreferrer">
                      {featuredImg ? (
                        <img src={featuredImg} alt={post.title.rendered} />
                      ) : (
                        <img src="https://placehold.co/600x400?text=No+Image" alt="No image" />
                      )}
                    </a>
                    <div className="card__body">
                      <h3 className="card__title">
                        <a href={post.link} target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                      </h3>
                      <p className="card__meta">{new Date(post.date).toLocaleDateString()}</p>
                      {showExcerpt && (
                        <p className="card__excerpt" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                      )}
                      <a className="btn btn--primary" href={post.link} target="_blank" rel="noopener noreferrer">{__('Read more', 'em')}</a>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
        <div className="em-slick-dots" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          {Array.from({ length: Math.min(postsToShow, 6) }).map((_, i) => (
            <button
              key={i}
              style={{
                width: '0.6rem',
                height: '0.6rem',
                borderRadius: '50%',
                border: '1px solid #e5e7eb',
                background: i === 0 ? '#2563eb' : 'transparent',
                cursor: 'pointer',
                outline: 'none',
                borderColor: i === 0 ? '#2563eb' : '#e5e7eb',
              }}
              tabIndex={-1}
              aria-hidden="true"
            />
          ))}
        </div>
      </section>
    </>
  );
}
