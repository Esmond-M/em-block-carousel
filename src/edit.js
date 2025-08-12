import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ToggleControl, TextControl, SelectControl, Spinner, Notice, __experimentalNumberControl as NumberControl } from '@wordpress/components';

const PostTypeOptions = [
  { label: 'Posts', value: 'post' },
];

export default function Edit( { attributes, setAttributes } ) {
  const { sectionTitle, postsToShow, categories, showExcerpt, postType, order, orderBy, maxWidth } = attributes;

  const { terms, isResolving } = useSelect( ( select ) => {
    const core = select( 'core' );
    const tax = 'category';
    const query = { per_page: 100, hide_empty: true };
    return {
      isResolving: core.isResolving( 'getEntityRecords', [ 'taxonomy', tax, query ] ),
      terms: core.getEntityRecords( 'taxonomy', tax, query ) || [],
    };
  }, [] );

  const blockProps = useBlockProps({
    className: 'em-slick-carousel is-editor',
    style: { '--em-carousel-max-width': maxWidth ? `${maxWidth}px` : undefined }
  });

  React.useEffect(() => {
    // Only run in editor preview
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
            { breakpoint: 600, settings: { slidesToShow: 1 } }
          ]
        });
      }, 200);
    }
  });

  return (
    <>
      <InspectorControls>
        <PanelBody title={ __('Content', 'em') } initialOpen>
          <TextControl
            label={ __('Section title', 'em') }
            value={ sectionTitle }
            onChange={ (v) => setAttributes({ sectionTitle: v }) }
          />
          <RangeControl
            label={ __('Posts to show', 'em') }
            min={ 1 } max={ 24 }
            value={ postsToShow }
            onChange={ (v) => setAttributes({ postsToShow: v }) }
          />
          <ToggleControl
            label={ __('Show excerpt', 'em') }
            checked={ showExcerpt }
            onChange={ (v) => setAttributes({ showExcerpt: v }) }
          />
          <SelectControl
            label={ __('Order by', 'em') }
            value={ orderBy }
            options={[
              { label: 'Date', value: 'date' },
              { label: 'Title', value: 'title' },
            ]}
            onChange={ (v) => setAttributes({ orderBy: v }) }
          />
          <SelectControl
            label={ __('Order', 'em') }
            value={ order }
            options={[
              { label: 'DESC', value: 'desc' },
              { label: 'ASC', value: 'asc' }
            ]}
            onChange={ (v) => setAttributes({ order: v }) }
          />
          <NumberControl
            label={ __('Max Width (px)', 'em') }
            value={ maxWidth }
            min={ 400 }
            max={ 2400 }
            onChange={ (v) => setAttributes({ maxWidth: Number(v) }) }
            help={ __('Set the maximum width of the carousel container.', 'em') }
          />
          <div style={{ marginTop: '8px' }}>
            <label className="components-base-control__label">{ __('Categories', 'em') }</label>
            { isResolving && <Spinner /> }
            { !isResolving && !terms.length && (
              <Notice status="warning" isDismissible={ false }>{ __('No categories found.', 'em') }</Notice>
            ) }
            { !isResolving && terms.length > 0 && (
              <div className="em-term-multiselect">
                { terms.map( t => (
                  <label key={ t.id } style={{ display: 'block', marginBottom: 4 }}>
                    <input
                      type="checkbox"
                      checked={ categories.includes(t.id) }
                      onChange={ (e) => {
                        const next = e.target.checked
                          ? [ ...categories, t.id ]
                          : categories.filter(id => id !== t.id);
                        setAttributes({ categories: next });
                      }}
                    /> { t.name }
                  </label>
                )) }
              </div>
            ) }
          </div>
        </PanelBody>
      </InspectorControls>

      <section { ...blockProps }>
        <div className="carousel__header">
          <h2 className="carousel__title">{ sectionTitle || __('Latest Posts', 'em') }</h2>
          <div className="carousel__controls">
            <button className="carousel__btn" disabled>‹</button>
            <button className="carousel__btn">›</button>
          </div>
        </div>
        <div className="carousel__viewport">
          <ul className="carousel__track">
            { Array.from({ length: Math.min(postsToShow, 6) }).map( (_,i) => (
              <li className="carousel__slide" key={i}>
                <article className="card is-skeleton">
                  <div className="card__media" />
                  <div className="card__body">
                    <h3 className="card__title"><span className="sk-line" /></h3>
                    <p className="card__meta"><span className="sk-line short" /></p>
                    { showExcerpt && <p className="card__excerpt"><span className="sk-line" /><span className="sk-line short" /></p> }
                    <span className="btn btn--primary">Read more</span>
                  </div>
                </article>
              </li>
            )) }
          </ul>
        </div>
        <div className="carousel__dots">
          <button className="is-active" /><button /><button />
        </div>
      </section>
    </>
  );
}
