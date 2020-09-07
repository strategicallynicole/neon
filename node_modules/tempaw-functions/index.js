/**
 * @todo action prototype
 * @todo preset prototype
 * @todo realType to instanceof
 * @todo описать параметры пресетов и действий сборки
 * @todo сделать параметры конфига необязательными, параметры по умолчанию
 * @todo улучшеные оповещения (сервер)
 * @todo проверка установки ImageMagick и установка по необходимости
 * @todo импорт нужных модулей в глобальные переменные
 * @todo подправить action.dummy, не нужно каждый раз выводить сообщение в консоль
 * @todo проверки параметров перенести в execute, а лучше в отдельную часть
 */

module.exports = {
	util:   require( './util.js' ),
	task:   require( './tasks.js' ),
	action: require( './actions.js' ),
	preset: require( './presets.js' ),
	init:   require( './init.js' )
};
