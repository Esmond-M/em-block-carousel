/**
 * EM Carousel Block
 */
import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import './editor.scss'; // Editor-only styles
import './style.scss';  // Front-end + editor shared styles

import metadata from './block.json';

// Register the block using the metadata and edit component
registerBlockType(metadata.name, {
  edit: Edit,
});
