module.exports = function( data ) {
	if ( !data ) data = {};

	const
		util   = require( '../util.js' ),
		action = require( '../actions.js' );

	data.execute = util.genBuildTask( function () {
		let ruleSet = [];

		// Update
		if( data.general ) {
			ruleSet = ruleSet.concat([
				action.transformContent({
					task: 'Update Pug',
					src: 'dev/pug/**/*.pug',
					dest: 'dev/pug-test/',
					callback( content ) {
						return content
							.replace(/brand-primary/g, 'primary')
							.replace(/gray-base/g, 'black')
							.replace(/bg-white/g, 'bg-default')
							.replace(/bg-primary/g, 'bg-accent')

							// Grid
							.replace(/\.shell/g, '.container')

							// range-reverse | unit-reverse => flex-row-reverse
							.replace(/\.(range|unit)-reverse/g, '.flex-row-reverse')
							.replace(/\.(range|unit)-xl-reverse/g, '.flex-xxl-row-reverse')
							.replace(/\.(range|unit)-lg-reverse/g, '.flex-xl-row-reverse')
							.replace(/\.(range|unit)-md-reverse/g, '.flex-lg-row-reverse')
							.replace(/\.(range|unit)-sm-reverse/g, '.flex-md-row-reverse')
							.replace(/\.(range|unit)-xs-reverse/g, '.flex-sm-row-reverse')

							// unit-horizontal => flex-sm-row
							.replace(/\.unit-horizontal/g, '.flex-row')
							.replace(/\.unit-xl-horizontal/g, '.flex-xxl-row')
							.replace(/\.unit-lg-horizontal/g, '.flex-xl-row')
							.replace(/\.unit-md-horizontal/g, '.flex-lg-row')
							.replace(/\.unit-sm-horizontal/g, '.flex-md-row')
							.replace(/\.unit-xs-horizontal/g, '.flex-sm-row')

							// unit-vertical => flex-sm-column
							.replace(/\.unit-vertical/g, '.flex-column')
							.replace(/\.unit-xl-vertical/g, '.flex-xxl-column')
							.replace(/\.unit-lg-vertical/g, '.flex-xl-column')
							.replace(/\.unit-md-vertical/g, '.flex-lg-column')
							.replace(/\.unit-sm-vertical/g, '.flex-md-column')
							.replace(/\.unit-xs-vertical/g, '.flex-sm-column')

							// range-center | unit-align-center => justify-content-center
							.replace(/\.range-center|\.unit-align-center/g, '.justify-content-center')
							.replace(/\.range-xl-center|\.unit-xl-align-center/g, '.justify-content-xxl-center')
							.replace(/\.range-lg-center|\.unit-lg-align-center/g, '.justify-content-xl-center')
							.replace(/\.range-md-center|\.unit-md-align-center/g, '.justify-content-lg-center')
							.replace(/\.range-sm-center|\.unit-sm-align-center/g, '.justify-content-md-center')
							.replace(/\.range-xs-center|\.unit-xs-align-center/g, '.justify-content-sm-center')

							// range-left | unit-align-left => justify-content-start
							.replace(/\.range-left|\.unit-align-left/g, '.justify-content-start')
							.replace(/\.range-xl-left|\.unit-xl-align-left/g, '.justify-content-xxl-start')
							.replace(/\.range-lg-left|\.unit-lg-align-left/g, '.justify-content-xl-start')
							.replace(/\.range-md-left|\.unit-md-align-left/g, '.justify-content-lg-start')
							.replace(/\.range-sm-left|\.unit-sm-align-left/g, '.justify-content-md-start')
							.replace(/\.range-xs-left|\.unit-xs-align-left/g, '.justify-content-sm-start')

							// range-right | unit-align-right => justify-content-end
							.replace(/\.range-right|\.unit-align-right/g, '.justify-content-end')
							.replace(/\.range-xl-right|\.unit-xl-align-right/g, '.justify-content-xxl-end')
							.replace(/\.range-lg-right|\.unit-lg-align-right/g, '.justify-content-xl-end')
							.replace(/\.range-md-right|\.unit-md-align-right/g, '.justify-content-lg-end')
							.replace(/\.range-sm-right|\.unit-sm-align-right/g, '.justify-content-md-end')
							.replace(/\.range-xs-right|\.unit-xs-align-right/g, '.justify-content-sm-end')

							// range-justify | unit-align-justify => justify-content-between
							.replace(/\.range-justify|\.unit-align-justify/g, '.justify-content-between')
							.replace(/\.range-xl-justify|\.unit-xl-align-justify/g, '.justify-content-xxl-between')
							.replace(/\.range-lg-justify|\.unit-lg-align-justify/g, '.justify-content-xl-between')
							.replace(/\.range-md-justify|\.unit-md-align-justify/g, '.justify-content-lg-between')
							.replace(/\.range-sm-justify|\.unit-sm-align-justify/g, '.justify-content-md-between')
							.replace(/\.range-xs-justify|\.unit-xs-align-justify/g, '.justify-content-sm-between')

							// range-around | unit-align-around => justify-content-around
							.replace(/\.range-around|\.unit-align-around/g, '.justify-content-around')
							.replace(/\.range-xl-around|\.unit-xl-align-around/g, '.justify-content-xxl-around')
							.replace(/\.range-lg-around|\.unit-lg-align-around/g, '.justify-content-xl-around')
							.replace(/\.range-md-around|\.unit-md-align-around/g, '.justify-content-lg-around')
							.replace(/\.range-sm-around|\.unit-sm-align-around/g, '.justify-content-md-around')
							.replace(/\.range-xs-around|\.unit-xs-align-around/g, '.justify-content-sm-around')

							// range-middle | unit-middle => align-items-center
							.replace(/\.(range|unit)-middle/g, '.align-items-center')
							.replace(/\.(range|unit)-xl-middle/g, '.align-items-xxl-center')
							.replace(/\.(range|unit)-lg-middle/g, '.align-items-xl-center')
							.replace(/\.(range|unit)-md-middle/g, '.align-items-lg-center')
							.replace(/\.(range|unit)-sm-middle/g, '.align-items-md-center')
							.replace(/\.(range|unit)-xs-middle/g, '.align-items-sm-center')

							// cell-middle = > align-self-center
							.replace(/\.cell-middle/g, '.align-self-center')
							.replace(/\.cell-xl-middle/g, '.align-self-xxl-center')
							.replace(/\.cell-lg-middle/g, '.align-self-xl-center')
							.replace(/\.cell-md-middle/g, '.align-self-lg-center')
							.replace(/\.cell-sm-middle/g, '.align-self-md-center')
							.replace(/\.cell-xs-middle/g, '.align-self-sm-center')

							// range-top | unit-top => align-items-start
							.replace(/\.(range|unit)-top/g, '.align-items-start')
							.replace(/\.(range|unit)-xl-top/g, '.align-items-xxl-start')
							.replace(/\.(range|unit)-lg-top/g, '.align-items-xl-start')
							.replace(/\.(range|unit)-md-top/g, '.align-items-lg-start')
							.replace(/\.(range|unit)-sm-top/g, '.align-items-md-start')
							.replace(/\.(range|unit)-xs-top/g, '.align-items-sm-start')

							// cell-top = > align-self-start
							.replace(/\.cell-top/g, '.align-self-start')
							.replace(/\.cell-xl-top/g, '.align-self-xxl-start')
							.replace(/\.cell-lg-top/g, '.align-self-xl-start')
							.replace(/\.cell-md-top/g, '.align-self-lg-start')
							.replace(/\.cell-sm-top/g, '.align-self-md-start')
							.replace(/\.cell-xs-top/g, '.align-self-sm-start')

							// range-bottom | unit-bottom => align-items-end
							.replace(/\.(range|unit)-bottom/g, '.align-items-end')
							.replace(/\.(range|unit)-xl-bottom/g, '.align-items-xxl-end')
							.replace(/\.(range|unit)-lg-bottom/g, '.align-items-xl-end')
							.replace(/\.(range|unit)-md-bottom/g, '.align-items-lg-end')
							.replace(/\.(range|unit)-sm-bottom/g, '.align-items-md-end')
							.replace(/\.(range|unit)-xs-bottom/g, '.align-items-sm-end')

							// cell-bottom = > align-self-end
							.replace(/\.cell-bottom/g, '.align-self-end')
							.replace(/\.cell-xl-bottom/g, '.align-self-xxl-end')
							.replace(/\.cell-lg-bottom/g, '.align-self-xl-end')
							.replace(/\.cell-md-bottom/g, '.align-self-lg-end')
							.replace(/\.cell-sm-bottom/g, '.align-self-md-end')
							.replace(/\.cell-xs-bottom/g, '.align-self-sm-end')

							// cell-push  => order
							.replace(/\.cell-push/g, '.order')
							.replace(/\.cell-xl-push/g, '.order-xxl')
							.replace(/\.cell-lg-push/g, '.order-xl')
							.replace(/\.cell-md-push/g, '.order-lg')
							.replace(/\.cell-sm-push/g, '.order-md')
							.replace(/\.cell-xs-push/g, '.order-sm')

							// cell-preffix => offset
							.replace(/\.cell-preffix/g, '.offset')
							.replace(/\.cell-xl-preffix/g, '.offset-xxl')
							.replace(/\.cell-lg-preffix/g, '.offset-xl')
							.replace(/\.cell-md-preffix/g, '.offset-lg')
							.replace(/\.cell-sm-preffix/g, '.offset-md')
							.replace(/\.cell-xs-preffix/g, '.offset-sm')

							// cell-prefix => offset
							.replace(/\.cell-prefix/g, '.offset')
							.replace(/\.cell-xl-prefix/g, '.offset-xxl')
							.replace(/\.cell-lg-prefix/g, '.offset-xl')
							.replace(/\.cell-md-prefix/g, '.offset-lg')
							.replace(/\.cell-sm-prefix/g, '.offset-md')
							.replace(/\.cell-xs-prefix/g, '.offset-sm')

							// col (old) => col (new)
							.replace(/\.col-xl-/g, '.col-xxl-')
							.replace(/\.col-lg-/g, '.col-xl-')
							.replace(/\.col-md-/g, '.col-lg-')
							.replace(/\.col-sm-/g, '.col-md-')
							.replace(/\.col-xs-/g, '.col-')

							// cell => col
							.replace(/\.cell-xl-/g, '.col-xxl-')
							.replace(/\.cell-lg-/g, '.col-xl-')
							.replace(/\.cell-md-/g, '.col-lg-')
							.replace(/\.cell-sm-/g, '.col-md-')
							.replace(/\.cell-xs-/g, '.col-sm-')

							// Range => row
							.replace(/\.range-condensed/g, '.no-gutters')
							.replace(/\.range-xl/g, '.row-xxl')
							.replace(/\.range-lg/g, '.row-xl')
							.replace(/\.range-md/g, '.row-lg')
							.replace(/\.range-sm/g, '.row-md')
							.replace(/\.range-xs/g, '.row-sm')
							.replace(/\.range/g, '.row')

							// veil => d-none
							.replace(/\.veil(?=[\.\s])/g, '.d-none')
							.replace(/\.veil-xl/g, '.d-xxl-none')
							.replace(/\.veil-lg/g, '.d-xl-none')
							.replace(/\.veil-md/g, '.d-lg-none')
							.replace(/\.veil-sm/g, '.d-md-none')
							.replace(/\.veil-xs/g, '.d-sm-none')

							// reveal-block => d-block
							.replace(/\.reveal-xl-/g, '.d-xxl-')
							.replace(/\.reveal-lg-/g, '.d-xl-')
							.replace(/\.reveal-md-/g, '.d-lg-')
							.replace(/\.reveal-sm-/g, '.d-md-')
							.replace(/\.reveal-xs-/g, '.d-sm-')
							.replace(/\.reveal-/g, '.d-')

							// text-center => text-center (breakpoints shift)
							.replace(/\.text-xl-center/g, '.text-xxl-center')
							.replace(/\.text-lg-center/g, '.text-xl-center')
							.replace(/\.text-md-center/g, '.text-lg-center')
							.replace(/\.text-sm-center/g, '.text-md-center')
							.replace(/\.text-xs-center/g, '.text-sm-center')

							// text-left => text-left (breakpoints shift)
							.replace(/\.text-xl-left/g, '.text-xxl-left')
							.replace(/\.text-lg-left/g, '.text-xl-left')
							.replace(/\.text-md-left/g, '.text-lg-left')
							.replace(/\.text-sm-left/g, '.text-md-left')
							.replace(/\.text-xs-left/g, '.text-sm-left')

							// text-right => text-right (breakpoints shift)
							.replace(/\.text-xl-right/g, '.text-xxl-right')
							.replace(/\.text-lg-right/g, '.text-xl-right')
							.replace(/\.text-md-right/g, '.text-lg-right')
							.replace(/\.text-sm-right/g, '.text-md-right')
							.replace(/\.text-xs-right/g, '.text-sm-right')

							// inset => inset (breakpoints shift)
							.replace(/\.inset-xl/g, '.inset-xxl')
							.replace(/\.inset-lg/g, '.inset-xl')
							.replace(/\.inset-md/g, '.inset-lg')
							.replace(/\.inset-sm/g, '.inset-md')
							.replace(/\.inset-xs/g, '.inset-sm')

							// section => section (breakpoints shift)
							// .replace(/\.section-xl/g, '.section-xxl')
							// .replace(/\.section-lg/g, '.section-xl')
							// .replace(/\.section-md/g, '.section-lg')
							// .replace(/\.section-sm/g, '.section-md')
							// .replace(/\.section-xs/g, '.section-sm')

							.replace(/data-xl-items/g, 'data-xxl-items')
							.replace(/data-lg-items/g, 'data-xl-items')
							.replace(/data-md-items/g, 'data-lg-items')
							.replace(/data-sm-items/g, 'data-md-items')
							.replace(/data-xs-items/g, 'data-sm-items')

							.replace(/text-italic/g, 'font-italic')
							.replace(/text-bold/g, 'font-weight-bold')

							// Forms
							.replace(/form-group/g, 'form-wrap')
							.replace(/form-control/g, 'form-input')

							// Tabs
							.replace(/\.tab-pane\.fade\.in\.active/g, '.tab-pane.fade.show.active')

							// Other
							.replace(/\.img-circle/g, '.rounded-circle')
					}
				}),
				action.transformContent({
					task: 'Update Sass',
					src: 'dev/scss/**/*.scss',
					dest: 'dev/scss-test/',
					callback( content ) {
						return content
							// Colors
							.replace(/brand-primary/g, 'primary')
							.replace(/gray-base/g, 'black')
							.replace(/bg-primary/g, 'bg-accent')
							.replace(/bg-white/g, 'bg-default')

							// Typography
							.replace(/\$font-size-large/g, '$font-size-lg')
							.replace(/\$font-size-small/g, '$font-size-sm')

							.replace(/\$font-size-h1/g, '$h1-font-size')
							.replace(/\$font-size-h2/g, '$h2-font-size')
							.replace(/\$font-size-h3/g, '$h3-font-size')
							.replace(/\$font-size-h4/g, '$h4-font-size')
							.replace(/\$font-size-h5/g, '$h5-font-size')
							.replace(/\$font-size-h6/g, '$h6-font-size')

							.replace(/\$font-lh-h1/g, '$h1-line-height')
							.replace(/\$font-lh-h2/g, '$h2-line-height')
							.replace(/\$font-lh-h3/g, '$h3-line-height')
							.replace(/\$font-lh-h4/g, '$h4-line-height')
							.replace(/\$font-lh-h5/g, '$h5-line-height')
							.replace(/\$font-lh-h6/g, '$h6-line-height')

							// Other variables
							.replace(/\$text-color/g, '$body-color')
							.replace(/\$input-color/g, '$form-input-color')
							.replace(/\$input-bg/g, '$form-input-background')
							.replace(/\$input-border-obj/g, '$form-input-border')
							.replace(/\$input-border/g, '$form-input-border-color')
							.replace(/\$input-border-focus/g, '$form-feedback-focus-color')
							.replace(/\$input-height-base/g, '$form-input-height')
							.replace(/\$input-font-size/g, '$form-input-font-size')
							.replace(/\$textarea-default-height/g, '$form-textarea-default-height')
							.replace(/\$textarea-default-min-height/g, '$form-textarea-default-min-height')
							.replace(/\$textarea-default-max-height/g, '$form-textarea-default-max-height')
							.replace(/\$border-radius-base/g, '$border-radius')

							// Grid
							.replace(/\$shell-lg-width/g, 'map-get($container-max-widths, xl)')
							.replace(/\$shell-md-width/g, 'map-get($container-max-widths, lg)')
							.replace(/\$shell-sm-width/g, 'map-get($container-max-widths, md)')

							// Media
							.replace(/\$screen-md-width/g, 'map-get($grid-breakpoints, lg)')
							.replace(/\$screen-lg-width/g, 'map-get($grid-breakpoints, xl)')
							.replace(/\$screen-sm-width/g, 'map-get($grid-breakpoints, md)')

							// Css mixin props
							.replace(/\@include display-flex;/g, 'display: flex;')
							.replace(/\@include display-flex\(\);/g, 'display: flex;')
							.replace(/\@include display-flex\(\s+\);/g, 'display: flex;')
							.replace(/\@include justify-content\((.*?)\);/g, 'justify-content: $1;')
							.replace(/\@include align-items\((.*?)\);/g, 'align-items: $1;')
							.replace(/\@include align-self\((.*?)\);/g, 'align-self: $1;')
							.replace(/\@include flex\((.*?)\);/g, 'flex: $1;')
							.replace(/\@include flex-grow\((.*?)\);/g, 'flex-grow: $1;')
							.replace(/\@include flex-shrink\((.*?)\);/g, 'flex-shrink: $1;')
							.replace(/\@include flex-wrap\((.*?)\);/g, 'flex-wrap: $1;')
							.replace(/\@include flex-direction\((.*?)\);/g, 'flex-direction: $1;')
							.replace(/\@include flex-basis\((.*?)\);/g, 'flex-basis: $1;')
							.replace(/\@include order\((.*?)\);/g, 'order: $1;')
							.replace(/\@include box-shadow\((.*?)\);/g, 'box-shadow: $1;')
							.replace(/\@include transform-origin\((.*?)\);/g, 'transform-origin: $1;')
							.replace(/\@include transform\((.*?)\);/g, 'transform: $1;')
							.replace(/\@include rotate\((.*?)\);/g, 'transform: rotate($1);')
							.replace(/\@include scale\((.*?)\);/g, 'transform: scale($1);')

							// Medias Up
							.replace(/\@media\s?\(min-width:\s?\$screen-xs\)\s?\{/g, '@include media-breakpoint-up(sm) {')
							.replace(/\@media\s?\(min-width:\s?\$screen-sm\)\s?\{/g, '@include media-breakpoint-up(md) {')
							.replace(/\@media\s?\(min-width:\s?\$screen-md\)\s?\{/g, '@include media-breakpoint-up(lg) {')
							.replace(/\@media\s?\(min-width:\s?\$screen-lg\)\s?\{/g, '@include media-breakpoint-up(xl) {')
							.replace(/\@media\s?\(min-width:\s?\$screen-xl\)\s?\{/g, '@include media-breakpoint-up(xxl) {')

							.replace(/\@media\s?\(min-width:\s?\$screen-xs-min\)\s?\{/g, '@include media-breakpoint-up(sm) {')
							.replace(/\@media\s?\(min-width:\s?\$screen-sm-min\)\s?\{/g, '@include media-breakpoint-up(md) {')
							.replace(/\@media\s?\(min-width:\s?\$screen-md-min\)\s?\{/g, '@include media-breakpoint-up(lg) {')
							.replace(/\@media\s?\(min-width:\s?\$screen-lg-min\)\s?\{/g, '@include media-breakpoint-up(xl) {')
							.replace(/\@media\s?\(min-width:\s?\$screen-xl-min\)\s?\{/g, '@include media-breakpoint-up(xxl) {')

							// Medias Down
							.replace(/\@media\s?\(max-width:\s?\$screen-xs-min - 1px\)\s?\{/g, '@include media-breakpoint-down(xs) {')
							.replace(/\@media\s?\(max-width:\s?\$screen-sm-min - 1px\)\s?\{/g, '@include media-breakpoint-down(sm) {')
							.replace(/\@media\s?\(max-width:\s?\$screen-xs-max\)\s?\{/g, '@include media-breakpoint-down(sm) {')
							.replace(/\@media\s?\(max-width:\s?\$screen-sm-max\)\s?\{/g, '@include media-breakpoint-down(md) {')
							.replace(/\@media\s?\(max-width:\s?\$screen-md-max\)\s?\{/g, '@include media-breakpoint-down(lg) {')
							.replace(/\@media\s?\(max-width:\s?\$screen-lg-max\)\s?\{/g, '@include media-breakpoint-down(xl) {')
							.replace(/\@media\s?\(max-width:\s?\$screen-xl-max\)\s?\{/g, '@include media-breakpoint-down(xxl) {')

							// Medias Between
							.replace(/\@media\s?\(min-width:\s?\$screen-xs-min\) and \(max-width: \$screen-xs-max\)\s?\{/g, '@include media-breakpoint-between(sm, sm) {')
							.replace(/\@media\s?\(min-width:\s?\$screen-sm-min\) and \(max-width: \$screen-sm-max\)\s?\{/g, '@include media-breakpoint-between(md, md) {')
							.replace(/\@media\s?\(min-width:\s?\$screen-md-min\) and \(max-width: \$screen-md-max\)\s?\{/g, '@include media-breakpoint-between(lg, lg) {')

							// Forms
							.replace(/form-group/g, 'form-wrap')
							.replace(/form-control/g, 'form-input')

							// Shell
							.replace(/\.shell/g, '.container')

							// Range
							.replace(/\.range-condensed/g, '.no-gutters')
							.replace(/\.range-xl/g, '.row-xxl')
							.replace(/\.range-lg/g, '.row-xl')
							.replace(/\.range-md/g, '.row-lg')
							.replace(/\.range-sm/g, '.row-md')
							.replace(/\.range-xs/g, '.row-sm')
							.replace(/\.range/g, '.row')

							// col (old) => col (new)
							.replace(/\.col-xl-/g, '.col-xxl-')
							.replace(/\.col-lg-/g, '.col-xl-')
							.replace(/\.col-md-/g, '.col-lg-')
							.replace(/\.col-sm-/g, '.col-md-')
							.replace(/\.col-xs-/g, '.col-')

							// cell => col
							.replace(/\.cell-xl-/g, '.col-xxl-')
							.replace(/\.cell-lg-/g, '.col-xl-')
							.replace(/\.cell-md-/g, '.col-lg-')
							.replace(/\.cell-sm-/g, '.col-md-')
							.replace(/\.cell-xs-/g, '.col-sm-')
							.replace(/\.cell/g, '.col')

							// units
							.replace(/\.unit__/g, '.unit-')

							// Offset
							.replace(/responsive-offset-media/g, 'grid-offset')
							.replace(/responsive-offset/g, 'grid-offset')

							// Builder
							.replace(/\[data-x-mode=\"design-mode\"\]/g, "[data-x-mode='true']")
							.replace(/\[data-x-mode=\'design-mode\'\]/g, "[data-x-mode='true']")

							// section => section (breakpoints shift)
							.replace(/\.section-xl/g, '.section-xxl')
							.replace(/\.section-lg/g, '.section-xl')
							.replace(/\.section-md/g, '.section-lg')
							.replace(/\.section-sm/g, '.section-md')
							.replace(/\.section-xs/g, '.section-sm')
					}
				})
			]);
		}

		// Offsets
		if( data.offsets ) {
			ruleSet = ruleSet.concat([
				action.transformContent({
					task: 'Remove Offsets',
					src: 'dev/pug/**/*.pug',
					dest: 'dev/pug-test/',
					callback( content ) {
						return content.replace(/\.offset-(.*?)[^\.\s\()]+/g, '') // offsets => none
					}
				})
			]);
		}

		if( ruleSet.length === 0 ) throw Error( 'At least something must be builded!' );
		return ruleSet;
	}());

	return data;
};
