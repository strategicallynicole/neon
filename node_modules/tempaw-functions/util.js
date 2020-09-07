const
	fs         = require( 'fs' ),
	fse        = require( 'fs-extra' ),
	gulp       = require( 'gulp' ),
	gutil      = require( 'gulp-util' ),
	html2json  = require( 'html2json' ).html2json,
	minifyHtml = require( 'html-minifier' ).minify,
	Balloon    = require( 'node-notifier' ).WindowsBalloon,
	notifier   = new Balloon();

function Util () {}


Util.exist = function ( testable ) {
	return typeof( testable ) !== 'undefined';
};

Util.realType = function ( object ) {
	return ( Object.prototype.toString.call( object ) ).replace( /[\[\] ]/g, '' ).replace( /object/g, '' ).toLowerCase();
};

Util.runtime = function ( time ) {
	time = process.hrtime( time );
	if( time[0] > 60 ) return `${~~(time[0]/60)}m ${time[0] - ~~(time[0]/60)*60}s`;
	else if( time[0] > 0 ) return `${time[0]}.${~~(time[1]/10000000)}s`;
	else if( time[0] <= 0 && time[1] > 1000000 ) return `${~~(time[1]/1000000)}ms`;
	else if( time[1] > 1000 ) return `${~~(time[1]/1000)}\u03BCs`;
	else return `${time[1]}ns`;
};

Util.addZeros = function ( n, length ) {
	length = length || 2;
	n = String(n);
	while ( n.length < length ) n = '0'+ n;
	return n;
};

Util.getDateTime = function () {
	let date = new Date();
	return [
		`${date.getFullYear()}.${this.addZeros( date.getMonth()+1 )}.${this.addZeros( date.getDate() )}`,
		`${this.addZeros( date.getHours() )}.${this.addZeros( date.getMinutes() )}.${this.addZeros( date.getSeconds() )}`
	];
};

Util.configLoad = function ( path ) {
	if ( !fs.existsSync( path ) ) fse.copySync( `/config.js`, path );
	delete require.cache[ require.resolve( path ) ];
	global.config = require( path );
	gutil.log( gutil.colors.green( 'Config loaded! 🐱' ) );
};

Util.defaultErrorHandler = function ( error ) {
	let errTitle = error.plugin.toUpperCase() +' Error',
		errMessage = 'Все очень плохо...';

	if( error.plugin === 'gulp-sass' ) {
		errMessage =
			error.messageOriginal +
			'\rAt: '+ error.line +':'+ error.column +
			'\rFile: '+ error.relativePath;
		console.error( errTitle +'\n'+ error.messageOriginal + '\nAt: '+ error.line +':'+ error.column +'\nFile: '+ error.relativePath );
	} else if ( error.plugin === 'gulp-less' ) {
		errMessage =
			error.message +
			'\rAt: '+ error.line +':'+ error.column +
			'\rFile: '+ error.fileName;
		console.error( errTitle +'\n'+ error.message + '\nAt: '+ error.line +':'+ error.column +'\nFile: '+ error.fileName );
	} else if( error.plugin === 'gulp-pug' || error.plugin === 'gulp-jade' ) {
		errMessage =
			( error.msg ? error.msg : error.name ) +
			( ( error.line && error.column ) ? ('\rAt: '+ error.line +':'+ error.column) : '' ) +
			( error.filename ? ('\rFile: '+ error.filename) : ('\rFile: '+ error.path) );
		console.error( errTitle +'\n'+ error.message );
	} else if( error.plugin === 'gulp-babel' ) {
		errMessage = error.message;
		console.error( errTitle +'\n'+ errMessage );
	} else {
		errMessage = JSON.stringify( error, '', 2 );
		console.error( errTitle +'\n'+ errMessage );
	}

	notifier.notify({
		title:   errTitle,
		message: errMessage,
		type:    'error',
		sound:   true,
		wait:    true
	});
};

Util.genBuildTask = function ( ruleSet ) {
	let execSet = [];

	for ( let i = 0; i < ruleSet.length; i++ ) {
		let rule = ruleSet[i];

		if ( rule.enable !== false ) {
			// Проверка типа правила
			// Если parallel положить в массив предыдущего элемента или добавить массив с элементом
			if ( rule.type && rule.type === 'parallel' ) {
				if ( this.realType( execSet[ execSet.length - 1 ] ) === 'array' ) {
					execSet[ execSet.length - 1 ].push( rule.execute );
				} else {
					execSet.push( [ rule.execute ] );
				}
			} else {
				execSet.push( rule.execute );
			}
		}
	}

	// Подстановка массивов в gulp.parallel
	// Если в массиве один элемент, достать его из массива
	for ( let i = 0; i < execSet.length; i++ ) {
		if ( this.realType( execSet[i] ) === 'array' ) {
			if ( execSet[i].length !== 1 ) execSet[i] = gulp.parallel( execSet[i] );
			else execSet[i] = execSet[i][0];
		}
	}

	return gulp.series( execSet );
};

Util.genBuildTasks = function () {
	Object.keys( global.config.buildRules ).forEach( ( ruleSet ) => {
		gulp.task( ruleSet, this.genBuildTask( config.buildRules[ ruleSet ] ) );
	});
};


/**
 * Чтение html из файла и конвертация его в json
 * @param {string} path - путь к html файлу
 * @return {object} json
 */
Util.getHtmlJson = function ( path ) {
	let
		content = fs.readFileSync( path, 'utf8' ),
		minified = minifyHtml( content, {
			html5: true,
			collapseWhitespace: true,
			processConditionalComments: true,
			removeComments: true,
			quoteCharacter: "'"
		}).replace(/<!DOCTYPE [^>]*>/, '');

	return html2json( minified );
};

/**
 * Обработка json после html2json
 * @param {object} htmlJson
 * @param {function} cb
 */
Util.procHtmlJson = function ( htmlJson, cb ) {
	if ( cb ) cb( htmlJson );
	if( htmlJson.child ) for( let i = 0; i < htmlJson.child.length; i++ ) this.procHtmlJson( htmlJson.child[i], cb );
};

/**
 * Слияние обьектов
 * @param {Array} sources - массив слияемых обьектов
 * @param {object} [options] - дополнительные опции
 * @param {Array} [options.except] - массив исключенных ключей
 * @param {boolean} [options.skipNull] - пропуск значений null
 * @return {object} - новый обьект
 */
Util.merge = function ( sources, options ) {
	options = options || {};
	var initial = {};

	for ( var s = 0; s < sources.length; s++ ) {
		var source = sources[ s ];
		if ( !source ) continue;

		for ( var key in source ) {
			if ( options.except && !options.except.indexOf( key ) ) {
				continue;
			} else if ( source[ key ] instanceof Object && !(source[ key ] instanceof Function) ) {
				initial[ key ] = Util.merge( [ initial[ key ], source[ key ] ], options );
			} else if ( options.skipNull && source[ key ] === null ) {
				continue;
			} else {
				initial[ key ] = source[ key ];
			}
		}
	}

	return initial;
};


module.exports = Util;
