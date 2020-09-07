const
	fs     = require( 'fs' ),
	gutil  = require( 'gulp-util' ),
	util   = require( '../util.js' ),
	action = require( '../actions.js' );

/**
 * Сборка livedemo версии шаблона
 * @param {object}  data
 * @param {string}  data.src          - путь к корневой папке шаблона
 * @param {string}  data.dest         - путь к папке назначения
 * @param {string}  [data.marker]     - имя маркера удаления
 * @param {boolean} [data.delPresets] - удаление атрибутов 'data-preset'
 * @param {boolean} [data.minifyimg]  - минифакация картинок
 * @param {string}  [data.task]       - отображаемое имя задачи
 * @return {object} - правило
 */
module.exports = function( data ) {
	if ( !data || !data.src || !data.dest ) throw Error( 'Required parameter of "build-livedemo" not specified (src, dest)' );
	if ( !data.marker ) data.marker = 'LIVEDEMO';

	data.execute = util.genBuildTask( function () {
		let ruleSet = [];

		// Определение существования переменных
		if ( fs.existsSync( `${data.src}/pug/_config.pug` ) && /layoutPanel\s*=\s*(false|true)/.test( fs.readFileSync( `${data.src}/pug/_config.pug`, 'utf8' ) ) ) {
			data.setLayoutPanel = true;
		}

		// Копирование основных файлов
		ruleSet = ruleSet.concat([
			action.copy({ type: 'parallel', src: `${data.src}/bat/**/*`,    dest: `${data.dest}/bat/` }),
			action.copy({ type: 'parallel', src: `${data.src}/js/**/*.js`,  dest: `${data.dest}/js/` }),
			action.copy({ type: 'parallel', src: `${data.src}/fonts/**/*`,  dest: `${data.dest}/fonts/` }),
			action.copy({ type: 'parallel', src: `${data.src}/audio/**/*`,  dest: `${data.dest}/audio/` }),
			action.copy({ type: 'parallel', src: `${data.src}/video/**/*`,  dest: `${data.dest}/video/` }),
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

		// Включение livedemo параметра в script.js
		// TODO заменить маркером
		ruleSet = ruleSet.concat([
			action.transformContent({
				src:  `${data.dest}/js/script.js`,
				dest: `${data.dest}/js/`,
				callback( content, file ) {
					gutil.log( gutil.colors.yellow( 'Enable "livedemo" at:' ), file.path );
					return content.replace( /livedemo\s*?=\s*?(true|false)/, 'livedemo = true' );
				}
			})
		]);

		// Принудительное включение layoutPanel
		// TODO заменить маркером
		if ( data.setLayoutPanel ) {
			ruleSet = ruleSet.concat([
				action.transformContent({
					src: `${data.dest}/tmp/pug/_config.pug`,
					dest: `${data.dest}/tmp/pug/`,
					callback( content ) {
						return content.replace(/layoutPanel\s*=\s*(false|true)/, 'layoutPanel = true');
					}
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

		// Минификация или копирование картинок
		if ( data.minifyimg ) {
			ruleSet = ruleSet.concat([
				action.minifyimg({ src: `${data.src}/images/**/*`, dest: `${data.dest}/images/` })
			]);
		} else {
			ruleSet = ruleSet.concat([
				action.copy({ src: `${data.src}/images/**/*`, dest: `${data.dest}/images/` })
			]);
		}

		// Удаление временных файлов
		ruleSet = ruleSet.concat([
			action.clean({ src: `${data.dest}/tmp` })
		]);

		return ruleSet;
	}());

	data.execute.displayName = data.task || 'Build LIVEDEMO';
	return data;
};
