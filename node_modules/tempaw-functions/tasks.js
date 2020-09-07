const
	gulp          = require( 'gulp' ),
	gutil         = require( 'gulp-util' ),
	browserSync   = require( 'browser-sync' ),
	plumber       = require( 'gulp-plumber' ),
	sass          = require( 'gulp-sass' ),
	less          = require( 'gulp-less' ),
	pug           = require( 'gulp-pug' ),
	jade          = require( 'gulp-jade' ),
	babel         = require( 'gulp-babel' ),
	sourcemaps    = require( 'gulp-sourcemaps' ),
	autoprefixer  = require( 'gulp-autoprefixer' ),
	emitty        = require( 'emitty' ).setup( 'dev', 'pug' ), // Hardcode
	lessToScss    = require( 'gulp-less-to-scss' ),
	gulpIf        = require( 'gulp-if' ),
	stylelint     = require( 'gulp-stylelint' ),
	puglint       = require( './local-modules/gulp-pug-lint.js' ),
	eslint        = require( 'gulp-eslint' ),
	htmlValidator = require( 'gulp-html-validator' ),
	rename        = require( 'gulp-rename' ),
	cache         = require( 'gulp-cache' ),
	Balloon       = require( 'node-notifier' ).WindowsBalloon,
	notifier      = new Balloon();

function scssLintFormatter ( report ) {
	report.forEach( function( file ) {
		file.warnings.forEach( function( warning ) {
			console.log( gutil.colors.red( '⨂' ), warning.text.replace( /\s*\(.*\)/, '' ), gutil.colors.gray( `[${warning.rule}]` ) );
			console.log( `${file.source}:${warning.line}:${warning.column}\n` );
		});

		if ( !global.globalLintReport ) global.globalLintReport = {};
		if ( !global.globalLintReport.scssErrors ) global.globalLintReport.scssErrors = 0;
		global.globalLintReport.scssErrors += file.warnings.length;
	});
}

function pugLintForamtter ( errors ) {
	errors.forEach( function ( error ) {
		let tmp = error.toJSON();
		console.log( gutil.colors.red( '⨂' ), tmp.msg, gutil.colors.gray( `[${tmp.code}]` ) );
		console.log( `${tmp.filename}${tmp.line?`:${tmp.line}`:''}${tmp.column?`:${tmp.column}`:''}\n` );
	});

	if ( !global.globalLintReport ) global.globalLintReport = {};
	if ( !global.globalLintReport.pugErrors ) global.globalLintReport.pugErrors = 0;
	global.globalLintReport.pugErrors += errors.length;
}

function esLintForamtter ( report ) {
	report.forEach( function( file ) {
		file.messages.forEach( function( message ) {
			switch( message.severity ) {
				case 0:
					console.log( gutil.colors.green( '☑' ), message.message, gutil.colors.gray( `[${message.ruleId}]` ) );
					break;
				case 1:
					console.log( gutil.colors.yellow( '⚠' ), message.message, gutil.colors.gray( `[${message.ruleId}]` ) );
					break;
				case 2:
					console.log( gutil.colors.red( '⨂' ), message.message, gutil.colors.gray( `[${message.ruleId}]` ) );
					break;
			}
			console.log( `${file.filePath}:${message.line}:${message.column}\n` );
		});
	});

	if ( !global.globalLintReport ) global.globalLintReport = {};
	if ( !global.globalLintReport.jsErrors ) global.globalLintReport.jsErrors = 0;
	if ( !global.globalLintReport.jsWarnings ) global.globalLintReport.jsWarnings = 0;

	global.globalLintReport.jsErrors += report.errorCount;
	global.globalLintReport.jsWarnings += report.warningCount;
}

function htmlValidateFormatter ( report ) {
	report.messages.forEach( function ( message ) {
		if ( !global.globalLintReport ) global.globalLintReport = {};
		switch( message.type ) {
			case 'error':
				console.log( gutil.colors.red( '⨂' ), message.message );
				if ( !global.globalLintReport.htmlErrors ) global.globalLintReport.htmlErrors = 0;
				global.globalLintReport.htmlErrors += 1;
				break;
			case 'info':
				console.log( gutil.colors.yellow( '⚠' ), message.message );
				if ( !global.globalLintReport.htmlWarnings ) global.globalLintReport.htmlWarnings = 0;
				global.globalLintReport.htmlWarnings += 1;
				break;
		}

		console.log( `${report.fileName}:${message.lastLine}:${message.firstColumn}\n` );
	});
}

module.exports = {
	sass( end ) {
		let fail = false, startTime = process.hrtime(), util = require( './util.js' );
		return gulp.src( global.config.sass.source )
			.pipe( plumber({ errorHandler: util.defaultErrorHandler }) )
			.pipe( sourcemaps.init({ loadMaps: true, largeFile: true, identityMap: true }) )
			.pipe( sass( global.config.sass.options ) )
			.on( 'error', function() {
				fail = true;
				end();
			} )
			.pipe( gulpIf( global.config.autoprefixer.enable, autoprefixer( global.config.autoprefixer.options ) ) )
			.pipe( sourcemaps.write( './' ) )
			.pipe( gulp.dest( global.config.sass.dest ) )
			.on( 'end', function() { if( !fail ) {
				browserSync.reload('*.css');
				notifier.notify({ title: 'SASS', message: `Successfully compiled!\r${ util.runtime( startTime ) }`, time: 3000 });
			}})
	},

	less() {
		let fail = false, startTime = process.hrtime(), util = require( './util.js' );
		return gulp.src( global.config.less.source )
			.pipe( plumber({ errorHandler: util.defaultErrorHandler }) )
			.pipe( sourcemaps.init({ loadMaps: true, largeFile: true, identityMap: true }) )
			.pipe( less() )
			.on( 'error', function() { fail = true } )
			.pipe( gulpIf( global.config.autoprefixer.enable, autoprefixer( global.config.autoprefixer.options ) ) )
			.pipe( sourcemaps.write( './' ) )
			.pipe( gulp.dest( global.config.less.dest ) )
			.on( 'end', function() { if( !fail ) {
				browserSync.reload('*.css');
				notifier.notify({ title: 'LESS', message: `Successfully compiled!\r${ util.runtime( startTime ) }`, time: 3000 });
			}})
	},

	pug() {
		return new Promise( function( resolve, reject ) {
			let
				fail = false,
				startTime = process.hrtime(),
				util = require( './util.js' ),
				main = function () {
					gulp.src( global.config.pug.source )
						.pipe( plumber({ errorHandler: util.defaultErrorHandler }) )
						.pipe( gulpIf( global.watch && global.config.pug.options.emitty, emitty.filter( global.emittyChangedFile ) ) )
						.pipe( pug( global.config.pug.options ) )
						.on( 'error', function() { fail = true } )
						.pipe( gulp.dest( global.config.pug.dest ) )
						.on( 'end', function() {
							if( !fail ) {
								browserSync.reload();
								notifier.notify({ title: 'PUG', message: `Successfully compiled!\r${ util.runtime( startTime ) }`, time: 3000 });
							}
							resolve();
						});
				};

			if ( global.config.pug.options.emitty ) emitty.scan( global.emittyChangedFile ).then( main );
			else main();
		});
	},

	jade() {
		let fail = false, startTime = process.hrtime(), util = require( './util.js' );
		return gulp.src( global.config.jade.source )
			.pipe( plumber({ errorHandler: util.defaultErrorHandler }) )
			.pipe( jade( global.config.jade.options ) )
			.on( 'error', function() { fail = true } )
			.pipe( gulp.dest( global.config.jade.dest ) )
			.on( 'end', function() { if( !fail ) {
				browserSync.reload();
				notifier.notify({ title: 'JADE', message: `Successfully compiled!\r${ util.runtime( startTime ) }`, time: 3000 });
			}})
	},

	babel() {
		let fail = false, startTime = process.hrtime(), util = require( './util.js' );
		return gulp.src( global.config.babel.source )
			.pipe( plumber({ errorHandler: util.defaultErrorHandler }) )
			.pipe( babel( global.config.babel.options ) )
			.on( 'error', function() { fail = true } )
			.pipe( gulp.dest( global.config.babel.dest ) )
			.on( 'end', function() { if( !fail ) {
				browserSync.reload();
				notifier.notify({ title: 'JS', message: `Successfully compiled!\r${ util.runtime( startTime ) }`, time: 3000 });
			}})
	},

	lintSass () {
		return gulp.src( global.config.lint.sass )
			.pipe( stylelint({
				config: require( './lint.config.json' ).scss,
				failAfterError: false,
				reporters: [{ formatter: scssLintFormatter }]
			}));
	},

	lintPug () {
		return gulp.src( global.config.lint.pug )
			.pipe( puglint({
				config: require( './lint.config.json' ).pug,
				reporter: pugLintForamtter
			}));
	},

	lintJs () {
		return gulp.src( global.config.lint.js )
			.pipe( eslint( require( './lint.config.json' ).js ) )
			.pipe( eslint.format( esLintForamtter ) );
	},

	validateHtml() {
		return gulp.src( global.config.lint.html )
			.pipe( htmlValidator({ format: 'json' }) )
			.on( 'data', function ( vinyl ) {
				var report = JSON.parse( vinyl['_contents'].toString( 'utf8' ) );
				report.fileName = vinyl.history[ vinyl.history.length - 1 ];
				htmlValidateFormatter( report );
			});
	},

	fullReport ( end ) {
		console.log( global.globalLintReport );
		end();
	},

	jadeToPug() {
		let startTime = process.hrtime(), util = require( './util.js' );
		return gulp.src( global.config.jadeToPug.source )
			.pipe( plumber({ errorHandler: util.defaultErrorHandler }) )
			.pipe( rename( function( path ) { path.extname = ".pug"; } ) )
			.pipe( gulp.dest( global.config.jadeToPug.dest ) )
			.on( 'end', function() {
				notifier.notify({ title: 'Conversion completed', message: util.runtime( startTime ), time: 3000 });
			})
	},

	lessToScss() {
		let startTime = process.hrtime(), util = require( './util.js' );
		return gulp.src( global.config.lessToScss.source )
			.pipe( plumber({ errorHandler: util.defaultErrorHandler }) )
			.pipe( lessToScss() )
			.pipe( gulp.dest( global.config.lessToScss.dest ) )
			.on( 'end', function() {
				notifier.notify({ title: 'Conversion completed', message: util.runtime( startTime ), time: 3000 });
			})
	},

	cache() {
		return cache.clearAll();
	}
};
