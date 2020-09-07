const
	fs     = require( 'fs' ),
	gutil  = require( 'gulp-util' ),
	util   = require( '../util.js' ),
	action = require( '../actions.js' );

/**
 * Сборка user package версии шаблона
 * @param data
 * @param {string}         data.src                      - путь к корневой папке шаблона
 * @param {string}         data.dest                     - путь к папке назначения
 * @param {string}         [data.marker]                 - имя маркера удаления
 * @param {boolean}        [data.delPresets]             - удаление атрибутов 'data-preset'
 * @param {boolean|object} [data.placeholder]            - замена картинок плейсхолдерами
 * @param {Array.string}   [data.placeholder.exclusions] - исключения из плейсхолдеров
 * @param {boolean}        [data.minifyimg]              - минифакация картинок
 * @param {string}         [data.task]                   - отображаемое имя задачи
 * @return {object} - правило
 */
module.exports = function( data ) {
	if ( !data || !data.src || !data.dest ) throw Error( 'Required parameter of "build-user-package" not specified (src, dest)' );
	if ( !data.marker ) data.marker = 'USERPACKAGE';

	data.execute = util.genBuildTask( function () {
		let ruleSet = [];

		// Определение существования переменных
		if ( fs.existsSync( `${data.src}/pug/_config.pug` ) && /layoutPanel\s*=\s*(false|true)/.test( fs.readFileSync( `${data.src}/pug/_config.pug`, 'utf8' ) ) ) {
			data.delLayoutPanel = true;
		}

		// Копирование основных файлов
		ruleSet = ruleSet.concat([
			action.copy({ type: 'parallel', src: `${data.src}/bat/**/*`,       dest: `${data.dest}/bat/` }),
			action.copy({ type: 'parallel', src: `${data.src}/js/**/*.js`,     dest: `${data.dest}/js/` }),
			action.copy({ type: 'parallel', src: `${data.src}/fonts/**/*`,     dest: `${data.dest}/fonts/` }),
			action.copy({ type: 'parallel', src: `${data.src}/audio/**/*`,     dest: `${data.dest}/audio/` }),
			action.copy({ type: 'parallel', src: `${data.src}/video/**/*`,     dest: `${data.dest}/video/` })
		]);

		// Копирование временных файлов
		ruleSet = ruleSet.concat([
			action.copy({ type: 'parallel', src: `${data.src}/pug/**/*.pug`,   dest: `${data.dest}/tmp/pug/` }),
			action.copy({ type: 'parallel', src: `${data.src}/scss/**/*.scss`, dest: `${data.dest}/tmp/scss/` })
		]);

		// Удаление фрагментов pug
		ruleSet = ruleSet.concat([
			action.delMarker({
				src: `${data.dest}/tmp/pug/**/*.pug`,
				dest: `${data.dest}/tmp/pug/`,
				marker: data.marker
			})
		]);

		// Удаление фрагментов js
		ruleSet = ruleSet.concat([
			action.delMarker({
				src: `${data.dest}/js/**/*.js`,
				dest: `${data.dest}/js/`,
				marker: data.marker
			})
		]);

		// Удаление фрагментов sass
		ruleSet = ruleSet.concat([
			action.delMarker({
				src: `${data.dest}/tmp/scss/**/*.scss`,
				dest: `${data.dest}/tmp/scss/`,
				marker: data.marker
			})
		]);

		// Отключение livedemo параметра в script.js
		ruleSet = ruleSet.concat([
			action.transformContent({
				src:  `${data.dest}/js/script.js`,
				dest: `${data.dest}/js/`,
				callback( content, file ) {
					gutil.log( gutil.colors.yellow( 'Disable "livedemo" at:' ), file.path );
					return content.replace( /livedemo\s*?=\s*?(true|false)/, 'livedemo = false' );
				}
			})
		]);

		// TODO применить маркеры
		// Операции удаления layoutPanel
		if ( data.delLayoutPanel ) {
			ruleSet = ruleSet.concat([
				action.transformContent({
					src: `${data.dest}/tmp/pug/_config.pug`,
					dest: `${data.dest}/tmp/pug/`,
					callback( content ) {
						return content.replace(/layoutPanel\s*=\s*(false|true)\s*,*\s*/, '');
					}
				}),
				action.transformContent({
					src: `${data.dest}/tmp/pug/_skeleton.pug`,
					dest: `${data.dest}/tmp/pug/`,
					callback( content ) {
						return content.replace(/\/\/\s*?PANEL(.|\s)*?_layout-panel\s*/, '');
					}
				}),
				action.transformContent({
					src: `${data.dest}/tmp/scss/custom-styles/!(_)*.scss`,
					dest: `${data.dest}/tmp/scss/custom-styles/`,
					callback( content ) {
						return content.replace(/@import\s*["']plugins\/layout-panel["'];\s*/, '');
					}
				}),
				action.clean({
					src: [
						`${data.dest}/tmp/pug/includes/_layout-panel.pug`,
						`${data.dest}/tmp/scss/custom-styles/plugins/_layout-panel.scss`
					]
				})
			]);
		}

		// Удаление 'data-preset' из pug файлов
		if ( data.delPresets ) {
			ruleSet = ruleSet.concat([
				action.transformContent({
					src: `${data.dest}/tmp/pug/**/*.pug`,
					dest: `${data.dest}/tmp/pug/`,
					callback( content ) {
						return content.replace( /data-preset\s*!=\s*{.*?}/g, '' )
					}
				})
			]);
		}

		// Компиляция sass
		ruleSet = ruleSet.concat([
			action.sass({ src: `${data.dest}/tmp/scss/**/!(_)*.scss`, dest: `${data.dest}/css/`, autoprefixer: false, nobase: true })
		]);

		// Компиляция pug
		ruleSet = ruleSet.concat([
			action.pug({ src: `${data.dest}/tmp/pug/pages/!(_)*.pug`, dest: `${data.dest}/` })
		]);

		// Копирование, минификация и замена картинок плейсхолдерами
		if ( data.placeholder ) {
			ruleSet = ruleSet.concat([
				action.copy({ src: `${data.src}/images/**/*`, dest: `${data.dest}/images/` }),
				action.imgPlaceholder({
					src: function() {
						return util.realType( data.placeholder ) === 'object' && data.placeholder.exclusions.length
							? `${data.dest}/images/**/!(${data.placeholder.exclusions.join('|')}).@(png|jpg)`
							: `${data.dest}/images/**/*.@(png|jpg)`
					}(),
					bgColor: data.placeholder.bgColor,
					textColor: data.placeholder.textColor
				}),
				action.minifyimg({ src: `${data.dest}/images/**/*`, dest: `${data.dest}/images/`, enable: data.minifyimg })
			]);
		} else if ( data.minifyimg ) {
			ruleSet.push( action.minifyimg({ src: `${data.src}/images/**/*`, dest: `${data.dest}/images/` }) );
		} else {
			ruleSet.push( action.copy({ src: `${data.src}/images/**/*`, dest: `${data.dest}/images/` }) );
		}

		// Удаление временных файлов
		ruleSet = ruleSet.concat([
			action.clean({ src: `${data.dest}/tmp` })
		]);

		return ruleSet;
	}());

	data.execute.displayName = data.task || 'Build USER PACKAGE';
	return data;
};
