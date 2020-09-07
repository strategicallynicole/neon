/**
 * Создание дистрибутива билдера
 * @param  {object}  data
 * @param  {string}  data.src          - путь к исходному билдеру
 * @param  {string}  data.dest         - папка назначения
 * @param  {string}  [data.marker]     - маркер удаления
 * @param  {string}  [data.lang]       - язык билдера ('en' || 'ru')
 * @param  {boolean} [data.demoMode]   - демо режим
 * @param  {boolean} [data.ldPassword] - установка пароля (novi_dev3107)
 * @param  {string}  [data.dev]        - путь к dev версии шаблона для вброса
 * @param  {Array}   [data.pages]      - конкретные страницы для вброса
 * @return {object}                    - правило
 * @todo check
 */
module.exports = function ( data ) {
	if ( !data || !data.src || !data.dest ) throw Error( 'Required parameter of "build-builder" not specified (src, dest)' );
	if ( !data.lang )     data.lang = 'en';
	if ( !data.demoMode ) data.demoMode = false;
	if ( !data.marker )   data.marker = 'BUILDER';

	const // Модули подключаются здесь из за проблем с областью видимости
		util         = require( '../util' ),
		action       = require( '../actions' ),
		preset       = require( '../presets' );

	data.execute = util.genBuildTask( function () {
		let ruleSet = [];

		ruleSet = ruleSet.concat([
			// Копирование билдера
			action.copy({
				src: data.src,
				dest: data.dest
			}),

			// Установка параметров билдера
			action.procJson({
				src:  `${data.dest}/config/config.json`,
				task: `Set necessary builder parameters`,
				callback( json ) {
					json.demoMode            = data.demoMode;
					json.showIntroduction    = true;
					json.jets                = false;
					json.checkForUpdates     = false;
					json.lang                = data.lang;
					json.enableAuthorization = true;
					return json;
				}
			}),
		]);

		// TODO узнать как кодируется
		if ( data.ldPassword ) {
			ruleSet = ruleSet.concat([
				action.transformContent({ // Установка пароля билдера 'novi_dev3107'
					src: `${data.dest}/php/session.php`,
					dest: `${data.dest}/php/`,
					task: `Set TM livedemo builder password 'novi_dev3107'`,
					callback(content) {
						return content
							.replace(/\$currentPassword\s*=\s*".*?";/, '$currentPassword = "38c73b1ece3b04b12b180834aed30f83a977c0ff00fe663037b35dcbbab192ca";')
							.replace(/\$currentToken\s*=\s*".*?";/, '$currentToken = "";')
					}
				})
			]);
		}

		// TODO полная пересборка и её параметры
		if ( data.dev ) {
			ruleSet = ruleSet.concat([
				preset.builderThrow({
					dev: data.dev,
					builder: data.dest,
					pages: data.pages,
					marker: data.marker
				})
			])
		}

		return ruleSet;
	}());

	return data;
};
