const
	util      = require( '../util' ),
	action    = require( '../actions' );

/**
 * Обновление шаблона в Novi билдере из dev версии (Вброс в билдер)
 * @param {object}  data
 * @param {string}  data.dev
 * @param {string}  data.builder
 * @param {string}  [data.marker] - имя маркера удаления
 * @param {string}  [data.backup] - путь к папке для бекапа важных файлов билдера (media, project.json, elements )
 * @param {string}  [data.tmp]    - путь к временной папке (промежуточная папка для обработки копированных из dev файлов)
 * @param {Array}   [data.pages]  - список страниц для вброса в билдер (остальные проигнорируются)
 * @param {boolean} [data.debug]  - отладочные логи
 * @param {string}  [data.task]   - отображаемое имя задачи
 * @return {object} - правило
 * @todo check
 */
module.exports = function ( data ) {
	if ( !data || !data.dev || !data.builder ) throw Error( 'Required parameter of "builder-throw" not specified (dev, builder)' );
	if ( !data.marker ) data.marker = 'BUILDER';
	if ( !data.backup ) data.backup = 'sources/backup-novi';
	if ( !data.tmp )    data.tmp    = 'tmp';
	if ( !data.pages ) data.pages = '!(_)*.html';
	else if ( data.pages instanceof Array ) data.pages = '*('+ data.pages.join('|') +').html';

	data.execute = util.genBuildTask( function () {
		let ruleSet = [];

		// TODO Предварительная проверка структуры dev, проверка существования нужных pug файлов

		ruleSet = ruleSet.concat([
			// Бекап важных файлов
			action.clean({ src: data.backup }),
			action.copy({ src: `${data.builder}/projects/template/project.json`, dest: `${data.backup}/` }),
			action.copy({ src: `${data.builder}/projects/template/elements/**/*`, dest: `${data.backup}/elements/` }),
			action.copy({ src: `${data.builder}/projects/template/novi/**/*`, dest: `${data.backup}/novi/` }),

			// Замена стилей и скриптов
			action.copy({ src:`${data.dev}/css/*.css`, dest:`${data.builder}/projects/template/css/` }),
			action.copy({ src:`${data.dev}/js/*.js`,   dest:`${data.builder}/projects/template/js/` }),

			// Замена картинок
			action.clean({ src: `${data.builder}/projects/template/images/**/*` }),
			action.copy({ src: `${data.dev}/images/**/*`, dest: `${data.builder}/projects/template/images/` }),

			// Создание паки tmp
			action.copy({ src: `${data.dev}/pug/**/*`, dest: `${data.tmp}/pug/` }),

			// Удаление фрагментов pug
			action.delMarker({
				src: `${data.tmp}/pug/**/*.pug`,
				dest: `${data.tmp}/pug/`,
				marker: data.marker
			}),

			// Компиляция всех страниц
			action.pug({ src: `${data.tmp}/pug/pages/!(_)*.pug`, dest: `${data.tmp}/` }),

			// Копирование в билдер только необходимых страниц
			action.clean({ src: `${data.builder}/projects/template/*.html` }),
			action.copy({ src: `${data.tmp}/${data.pages}`, dest: `${data.builder}/projects/template/` }),

			// Удаление мусора из разметки страниц (data-preset)
			action.htmlAsJson({
				src: `${data.builder}/projects/template/*.html`,
				task: `Remove "data-preset" attributes from pages`,
				callback: function (json) {
					if (json.node === 'element' && json.attr && json.attr.hasOwnProperty('data-preset')) {
						delete json.attr['data-preset'];
					}
				}
			}),

			// Регенерация страниц
			action.genPages({ builder: data.builder, debug: data.debug }),

			// Регенерация пресетов
			action.clean({ src: `${data.builder}/projects/template/elements/*.html` }),
			action.genPresets({ html: `${data.tmp}/*.html`, builder: data.builder, debug: data.debug }),

			// Удаление папки tmp
			action.clean({ src: data.tmp })
		]);

		return ruleSet;
	}());

	data.execute.displayName = data.task || 'Throw in Novi';
	return data;
};
