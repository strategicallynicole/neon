/**
 * Сборка версии шаблона для Template Monster (см.ниже параметры по умолчанию)
 * @param {object}  [data]
 * @param {string}  [data.task]           - отображаемое имя задачи
 * @param {boolean} [data.clean]          - очистка дистрибутива перед сборкой (для удаления мусора, файлы и папки начинающиеся с точки не удаляются)
 * @param {boolean} [data.livedemo]       - демонстрационная версия для магазина
 * @param {boolean} [data.granter]        - распространяемая версия для клиента
 * @param {boolean} [data.builder]        - версия с билдером (для livedemo и granter)
 * @param {boolean} [data.granterPsd]     - вложить psd с исходным дизайном для granter версии
 * @param {boolean} [data.toc]            - создание содержания для style.css (Table of Contents) (ВНИМАНИЕ: редактирует исходные файлы)
 * @param {boolean} [data.delPresets]     - удаление атрибутов 'data-preset' из версий livedemo и granter (не в билдере)
 * @param {boolean} [data.minifyimg]      - минифакация картинок
 * @param {object}  [data.paths]          - доступные изменяемые пути к файлам и папкам проекта
 * @param {string}  [data.paths.dev]      - путь к dev папке
 * @param {string}  [data.paths.builder]  - путь к исходному билдеру
 * @param {string}  [data.paths.dist]     - путь к собираемому дистрибутиву
 * @param {string}  [data.paths.livedemo] - путь к собираемой livedemo версии (относительно папки дистрибутива)
 * @param {string}  [data.paths.granter]  - путь к собираемой granter версии (относительно папки дистрибутива)
 * @param {string}  [data.paths.psd]      - путь к папке из которой будут взяты psd и ico для грантера (если granterPsd включен)
 * @param {string}  [data.paths.tocCss]   - путь к готовому style.css для генерации TOC (относительно dev, если toc включен)
 * @param {string}  [data.paths.tocScss]  - путь к изменяемому style.scss для вставки TOC (относительно dev, если toc включен)
 * @return {object} - правило
 */
module.exports = function( data ) {
	const
		util   = require( '../util.js' ),
		action = require( '../actions.js' ),
		preset = require( '../presets.js' );

	// Параметры по умолчанию
	let defaults = {
		clean:      true,
		livedemo:   true,
		granter:    true,
		builder:    true,
		granterPsd: false,
		toc:        true,
		delPresets: true,
		minifyimg:  true,
		task:       'Template build for TemplateMonster',
		paths: {
			dev:      'dev',
			dist:     'dist',
			builder:  'builder',
			livedemo: 'livedemo',
			granter:  'granter',
			psd:      'sources/psd',
			tocCss:   'css/style.css',
			tocScss:  'scss/custom/style.scss',
		}
	};

	// Слияние полученных параметров и параметров по умолчаню
	data = util.merge( [ defaults, data ], { skipNull: true } );

	data.execute = util.genBuildTask( function () {
		let ruleSet = [];

		// Генерация Table of contents
		if ( data.toc ) {
			ruleSet = ruleSet.concat([
				action.genTOC({ css: `${data.paths.dev}/${data.paths.tocCss}`, scss: `${data.paths.dev}/${data.paths.tocScss}` })
			]);
		}

		// Очистка дистрибутива
		if( data.clean ) {
			ruleSet = ruleSet.concat([
				action.clean({ src:`${data.paths.dist}/!(.)*` })
			]);
		}

		// LiveDemo
		if( data.livedemo ) {
			ruleSet = ruleSet.concat([
				preset.buildLiveDemo({
					src: data.paths.dev,
					dest: `${data.paths.dist}/${data.paths.livedemo}${data.builder?'/site':''}`,
					minifyimg: data.minifyimg,
					delPresets: data.delPresets
				})
			]);
		}

		// Granter
		if( data.granter ) {
			ruleSet = ruleSet.concat([
				preset.buildGranter({
					src: data.paths.dev,
					dest: `${data.paths.dist}/${data.paths.granter}`,
					minifyimg: data.minifyimg,
					delPresets: data.delPresets
				})
			]);
		}

		// Live demo builder
		if( data.builder && data.livedemo ) {
			ruleSet = ruleSet.concat([
				preset.buildBuilder({
					src: `${data.paths.builder}/**/*`,
					dest: `${data.paths.dist}/${data.paths.livedemo}/builder`,
					demoMode: true,
					ldPassword: true
				})
			]);
		}

		// Granter Builder
		if( data.builder && data.granter ) {
			ruleSet = ruleSet.concat([
				preset.buildBuilder({
					src: `${data.paths.builder}/**/*`,
					dest: `${data.paths.dist}/${data.paths.granter}/builder`
				})
			]);
		}

		// PSD
		if( data.granter && data.granterPsd ) {
			ruleSet = ruleSet.concat([
				action.copy({ src: `${data.paths.psd}/**/*.psd`, dest: `${data.paths.dist}/${data.paths.granter}/sources/psd/` }),
				action.copy({ src: `${data.paths.psd}/*.ico`,    dest: `${data.paths.dist}/${data.paths.granter}/sources/psd/` })
			]);
		}

		if( ruleSet.length === 0 ) throw Error( 'At least something must be build!' );
		return ruleSet;
	}());

	data.execute.displayName = data.task;
	return data;
};
