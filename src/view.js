/**
 * Use this file for JavaScript code that you want to run in the front-end
 * on posts/pages that contain this block.
 *
 * When this file is defined as the value of the `viewScript` property
 * in `block.json` it will be enqueued on the front end of the site.
 *
 * Example:
 *
 * ```js
 * {
 *   "viewScript": "file:./view.js"
 * }
 * ```
 *
 * If you're not making any changes to this file because your project doesn't need any
 * JavaScript running in the front-end, then you should delete this file and remove
 * the `viewScript` property from `block.json`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#view-script
 */

/* eslint-disable no-console */

/* eslint-enable no-console */

(function () {
  const roots = document.querySelectorAll('.wp-block-em-latest-posts-carousel');
  if (!roots.length) return;
  roots.forEach(init);

  function init(root) {
    const track = root.querySelector('.carousel__track');
    const prev  = root.querySelector('[data-carousel-prev]');
    const next  = root.querySelector('[data-carousel-next]');
    const dotsWrap = root.querySelector('[data-carousel-dots]');
    if (!track) return;

    const slides = Array.from(track.children);
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => scrollToIndex(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    const getSlideWidth = () => slides[0]?.getBoundingClientRect().width || 0;
    const getGap = () => parseFloat(getComputedStyle(track).gap || 0);

    function indexFromScroll() {
      const sw = getSlideWidth() + getGap();
      return Math.round(track.scrollLeft / sw);
    }
    function scrollToIndex(i) {
      const sw = getSlideWidth() + getGap();
      track.scrollTo({ left: i * sw, behavior: 'smooth' });
    }
    function updateUI() {
      const i = indexFromScroll();
      dots.forEach((d, n) => d.classList.toggle('is-active', n === i));
      if (prev) prev.disabled = i <= 0;
      if (next) next.disabled = i >= slides.length - 1;
    }

    prev?.addEventListener('click', () => scrollToIndex(Math.max(indexFromScroll() - 1, 0)));
    next?.addEventListener('click', () => scrollToIndex(Math.min(indexFromScroll() + 1, slides.length - 1)));

    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next?.click(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); prev?.click(); }
    });

    track.addEventListener('scroll', debounce(updateUI, 60), { passive: true });
    window.addEventListener('resize', debounce(updateUI, 120));
    updateUI();

    function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }
  }
})();
