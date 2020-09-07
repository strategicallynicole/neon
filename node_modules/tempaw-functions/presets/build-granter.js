const
	fs     = require( 'fs' ),
	gutil  = require( 'gulp-util' ),
	util   = require( '../util.js' ),
	action = require( '../actions.js' );

/**
 * Сборка granter-версии шаблона
 * @param data
 * @param {string}        data.src          - путь к корневой папке шаблона
 * @param {string|object} data.dest         - путь к папке назначения
 * @param {string}        [data.marker]     - имя маркера удаления
 * @param {boolean}       [data.delPresets] - удаление атрибутов 'data-preset'
 * @param {boolean}       [data.minifyimg]  - минифакация картинок
 * @param {string}        [data.task]       - отображаемое имя задачи
 * @return {object} - правило
 */
module.exports = function( data ) {
	if ( !data || !data.src || !data.dest ) throw Error( 'Required parameter of "build-granter" not specified (src, dest)' );
	if ( !data.marker ) data.marker = 'GRANTER';
	if ( util.realType( data.dest ) !== 'object' ) {
		data.dest = {
			site: `${data.dest}/site`,
			sources: `${data.dest}/sources`
		}
	}

	data.execute = util.genBuildTask( function () {
		let ruleSet = [];

		// Определение существования переменных
		if ( fs.existsSync( `${data.src}/pug/_config.pug` ) && /layoutPanel\s*=\s*(false|true)/.test( fs.readFileSync( `${data.src}/pug/_config.pug`, 'utf8' ) ) ) {
			data.delLayoutPanel = true;
		}

		// Копирование основных файлов
		ruleSet = ruleSet.concat([
			action.copy({ type: 'parallel', src: `${data.src}/bat/**/*`,       dest: `${data.dest.site}/bat/` }),
			action.copy({ type: 'parallel', src: `${data.src}/js/**/*.js`,     dest: `${data.dest.site}/js/` }),
			action.copy({ type: 'parallel', src: `${data.src}/fonts/**/*`,     dest: `${data.dest.site}/fonts/` }),
			action.copy({ type: 'parallel', src: `${data.src}/audio/**/*`,     dest: `${data.dest.site}/audio/` }),
			action.copy({ type: 'parallel', src: `${data.src}/video/**/*`,     dest: `${data.dest.site}/video/` }),
			action.copy({ type: 'parallel', src: `${data.src}/pug/**/*.pug`,   dest: `${data.dest.sources}/pug/` }),
			action.copy({ type: 'parallel', src: `${data.src}/scss/**/*.scss`, dest: `${data.dest.sources}/scss/` }),
		]);

		// Удаление фрагментов pug
		ruleSet = ruleSet.concat([
			action.delMarker({
				src: `${data.dest.sources}/pug/**/*.pug`,
				dest: `${data.dest.sources}/pug/`,
				marker: data.marker
			})
		]);

		// Удаление фрагментов js
		ruleSet = ruleSet.concat([
			action.delMarker({
				src: `${data.dest.site}/js/**/*.js`,
				dest: `${data.dest.site}/js/`,
				marker: data.marker
			})
		]);

		// Удаление фрагментов sass
		ruleSet = ruleSet.concat([
			action.delMarker({
				src: `${data.dest.sources}/scss/**/*.scss`,
				dest: `${data.dest.sources}/scss/`,
				marker: data.marker
			})
		]);

		// Отключение livedemo параметра в script.js
		ruleSet = ruleSet.concat([
			action.transformContent({
				src:  `${data.dest.site}/js/script.js`,
				dest: `${data.dest.site}/js/`,
				callback( content, file ) {
					gutil.log( gutil.colors.yellow( 'Disable "livedemo" at:' ), file.path );
					return content.replace( /livedemo\s*?=\s*?(true|false)/, 'livedemo = false' );
				}
			})
		]);

		// todo применить маркеры
		// Операции удаления layoutPanel
		if ( data.delLayoutPanel ) {
			ruleSet = ruleSet.concat([
				action.transformContent({
					src: `${data.dest.sources}/pug/_config.pug`,
					dest: `${data.dest.sources}/pug/`,
					callback( content ) {
						return content.replace(/layoutPanel\s*=\s*(false|true)\s*,*\s*/, '');
					}
				}),
				action.transformContent({
					src: `${data.dest.sources}/pug/_skeleton.pug`,
					dest: `${data.dest.sources}/pug/`,
					callback( content ) {
						return content.replace(/\/\/\s*?PANEL(.|\s)*?_layout-panel\s*/, '');
					}
				}),
				action.transformContent({
					src: `${data.dest.sources}/scss/custom-styles/!(_)*.scss`,
					dest: `${data.dest.sources}/scss/custom-styles/`,
					callback( content ) {
						return content.replace(/@import\s*["']plugins\/layout-panel["'];\s*/, '');
					}
				}),
				action.clean({
					src: [
						`${data.dest.sources}/pug/includes/_layout-panel.pug`,
						`${data.dest.sources}/scss/custom-styles/plugins/_layout-panel.scss`
					]
				})
			]);
		}

		// Удаление 'data-preset' из pug файлов
		if ( data.delPresets ) {
			ruleSet = ruleSet.concat([
				action.transformContent({
					src:  `${data.dest.sources}/pug/**/*.pug`,
					dest: `${data.dest.sources}/pug/`,
					callback ( content ) {
						return content.replace( /data-preset\s*!=\s*{.*?}/g, '' )
					}
				})
			]);
		}

		// Компиляция sass
		ruleSet = ruleSet.concat([
			action.sass({ src: `${data.dest.sources}/scss/**/!(_)*.scss`, dest: `${data.dest.site}/css/`, autoprefixer: false, nobase: true })
		]);

		// Компиляция pug
		ruleSet = ruleSet.concat([
			action.pug({ src: `${data.dest.sources}/pug/pages/!(_)*.pug`, dest: `${data.dest.site}/` })
		]);

		// Минификация или копирование картинок
		if ( data.minifyimg ) {
			ruleSet = ruleSet.concat([
				action.minifyimg({ src: `${data.src}/images/**/*`, dest: `${data.dest.site}/images/` })
			]);
		} else {
			ruleSet = ruleSet.concat([
				action.copy({ src: `${data.src}/images/**/*`, dest: `${data.dest.site}/images/` })
			]);
		}

		return ruleSet;
	}());

	data.execute.displayName = data.task || 'Build GRANTER';
	return data;
};
