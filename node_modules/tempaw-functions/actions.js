const
	fs           = require( 'fs' ),
	glob         = require( 'glob' ),
	gulp         = require( 'gulp' ),
	gulpIf       = require( 'gulp-if' ),
	gm           = require( 'gm' ),
	path         = require( 'path' ),
	pug          = require( 'gulp-pug' ),
	sass         = require( 'gulp-sass' ),
	jade         = require( 'gulp-jade' ),
	less         = require( 'gulp-less' ),
	babel        = require( 'gulp-babel' ),
	gutil        = require( 'gulp-util' ),
	del          = require( 'del' ),
	mkdirp       = require( 'mkdirp' ),
	zip          = require( 'gulp-zip' ),
	imagemin     = require( 'gulp-imagemin' ),
	insert       = require( 'gulp-insert' ),
	rename       = require( 'gulp-rename' ),
	rtlcss       = require( 'gulp-rtlcss' ),
	autoprefixer = require( 'gulp-autoprefixer' ),
	cache        = require( 'gulp-cache' ),
	json2html    = require( 'html2json' ).json2html,
	prettyHtml   = require( 'pretty'),
	util         = require( './util' );

let action = {};

// TODO комментарии
// TODO nobase для всех возможных тасков (см. action.sass)

action.dummy = function ( data ) {
	if ( !data ) data = {};

	data.execute = function ( end ) {
		if ( data.callback ) data.callback();
		gutil.log( gutil.colors.magenta( 'EXEC DUMMY:' ), data );
		end();
	};

	data.execute.displayName = data.task || 'd u m m y';
	return data;
};

action.copy = function ( data ) {
	if ( !data || !data.src || !data.dest ) throw Error( 'Required parameter of "copy" not specified (src, dest)' );

	data.execute = function () {
		if ( data.callback ) data.callback();
		gutil.log( 'Copy:', gutil.colors.magenta( data.src ), '>>', gutil.colors.magenta( data.dest ) );
		return gulp.src( data.src, { allowEmpty: true } ).pipe( gulp.dest( data.dest ) );
	};

	data.execute.displayName = data.task || 'Copy';
	return data;
};

action.clean = function ( data ) {
	if ( !data || !data.src ) throw Error( 'Required parameter of "clean" not specified (src)' );

	data.execute = function () {
		if ( data.callback ) data.callback();
		gutil.log( 'Clean:', gutil.colors.magenta( data.src ) );
		return del( data.src );
	};

	data.execute.displayName = data.task || 'Clean';
	return data;
};

action.pack = function ( data ) {
	if ( !data || !data.src || !data.dest ) throw Error( 'Required parameter of "pack" not specified (src, dest)' );

	data.execute = function () {
		let util = require( './util.js' );
		if ( data.callback ) data.callback();
		gutil.log( 'Pack:', gutil.colors.magenta( data.src ), '>>', gutil.colors.magenta( data.dest ) );
		return gulp.src( data.src, { base: data.base || "./" } )
			.pipe( zip( function () {
				if( data.name && util.realType( data.name ) === 'function' ) {
					return data.name( util.getDateTime() );
				} else if( data.name && util.realType( data.name ) === 'string' ) {
					return data.name;
				} else {
					let dateTime = util.getDateTime();
					return `${dateTime[0]}-${dateTime[1]}.zip`;
				}
			}() ))
			.pipe( gulp.dest( data.dest ) );
	};

	data.execute.displayName = data.task || 'Pack';
	return data;
};

action.minifyimg = function ( data ) {
	if ( !data || !data.src || !data.dest ) throw Error( 'Required parameter of "minifyimg" not specified (src, dest)' );

	data.execute = function () {
		if ( data.callback ) data.callback();
		gutil.log( 'Minify images:', gutil.colors.magenta( data.src ), '>>', gutil.colors.magenta( data.dest ) );
		return gulp.src( data.src, data.opts )
			.pipe( cache( imagemin([
				imagemin.gifsicle({ interlaced: true }),
				imagemin.jpegtran({ progressive: true }),
				imagemin.optipng({ optimizationLevel: 5 })
			], { verbose: true }) ) )
			.pipe( gulp.dest( data.dest ) );
	};

	data.execute.displayName = data.task || 'Minify Images';
	return data;
};

action.imgPlaceholder = function ( data ) {
	if ( !data || !data.src ) throw Error( 'Required parameter of "imgPlaceholder" not specified (src)' );

	data.execute = function () {
		if ( data.callback ) data.callback();
		gutil.log( 'Images Placeholder:', gutil.colors.magenta( data.src ) );
		var files = glob.sync( data.src ),
			promises = [];

		for ( var i = 0; i < files.length; i++ ) {
			promises.push( new Promise( function( resolve, reject ) {
				var currentFile = files[i];
				gm( currentFile ).identify( function( err, image ) {
					function Canvas( image ) {
						this.image = image;
						this.dest = this.image.path;
						this.title = {};
						this.title.value      = this.image.size.width +'x'+ this.image.size.height;
						this.title.fontFamily = 'Consolas';
						this.title.fontSize   = this.image.size.height*.4;
						this.title.charWidth  = this.title.fontSize * .56;
						this.title.charHeight = this.title.fontSize * .7;
						this.title.width      = this.title.value.length * this.title.charWidth;
						this.title.height     = this.title.charHeight;
						this.title.x          = this.image.size.width/2 - this.title.width/2;
						this.title.y          = this.image.size.height/2 - this.title.charHeight/2;
						this.bgColor          = data.bgColor || 'rgb(204,204,204)';
						this.textColor        = data.textColor || 'rgb(150,150,150)';
						this.recalcTitle();
					}

					Canvas.prototype.recalcTitle = function() {
						if( this.image.size.width * .5 < this.title.width ) {
							this.title.width      = this.image.size.width * .5;
							this.title.charWidth  = this.title.width / this.title.value.length;
							this.title.fontSize   = this.title.charWidth / .56;
							this.title.charHeight = this.title.fontSize * .7;
							this.title.height     = this.title.charHeight;
							this.title.x          = this.image.size.width/2 - this.title.width/2;
							this.title.y          = this.image.size.height/2 - this.title.charHeight/2;
						}
					};

					Canvas.prototype.draw = function() {
						gm( this.image.path )
							.fill( this.bgColor )
							.drawRectangle( 0, 0, this.image.size.width, this.image.size.height )
							.font( this.title.fontFamily )
							.fontSize( this.title.fontSize )
							.fill( this.textColor )
							.drawText( this.title.x, this.title.y + this.title.height, this.title.value )
							.write( this.image.path, function ( err ) {
								if ( err ) {
									gutil.log( gutil.colors.red( '✗' ), currentFile );
									gutil.log( err );
								} else {
									gutil.log( gutil.colors.green( '✓' ), currentFile );
								}
								resolve();
							});
					};

					var params = new Canvas( image );
					params.draw();
				});
			}));
		}

		return Promise.all( promises );
	};

	data.execute.displayName = data.task || 'Images Placeholder';
	return data;
};

action.rtlCSS = function ( data ) {
	if ( !data || !data.src || !data.dest ) throw Error( 'Required parameter of "rtlCSS" not specified (src, dest)' );

	data.execute = function () {
		if ( data.callback ) data.callback();
		gutil.log( 'Rtl CSS:', gutil.colors.magenta( data.src ), '>>', gutil.colors.magenta( data.dest ) );
		return gulp.src( data.src, data.opts )
			.pipe( rtlcss() )
			.pipe( rename({ suffix: '-rtl' }) )
			.pipe( gulp.dest( data.dest ) );
	};

	data.execute.displayName = data.task || 'Rtl CSS';
	return data;
};

action.transformContent = function ( data ) {
	if ( !data || !data.src || !data.dest || !data.callback ) throw Error( 'Required parameter of "transformContent" not specified (src, dest, callback)' );

	data.execute = function () {
		gutil.log( 'Transform Content:', gutil.colors.magenta( data.src ), '>>', gutil.colors.magenta( data.dest ) );
		return gulp.src( data.src, data.opts )
			.pipe( insert.transform( function( contents, file ) {
				return data.callback( contents, file );
			}))
			.pipe( gulp.dest( data.dest ) );
	};

	data.execute.displayName = data.task || 'Transform Content';
	return data;
};

action.pug = function ( data ) {
	if ( !data || !data.src || !data.dest ) throw Error( 'Required parameter of "pug" not specified (src, dest)' );

	data.execute = function () {
		if ( data.callback ) data.callback();
		gutil.log( 'Compile PUG:', gutil.colors.magenta( data.src ), '>>', gutil.colors.magenta( data.dest ) );
		return gulp.src( data.src, data.opts )
			.pipe( pug( global.config.pug.options ) )
			.pipe( gulp.dest( data.dest ) );
	};

	data.execute.displayName = data.task || 'Pug';
	return data;
};

action.sass = function ( data ) {
	if ( !data || !data.src || !data.dest ) throw Error( 'Required parameter of "sass" not specified (src, dest)' );

	data.execute = function () {
		if ( data.callback ) data.callback();
		gutil.log( 'Compile SASS:', gutil.colors.magenta( data.src ), '>>', gutil.colors.magenta( data.dest ) );
		return gulp.src( data.src, data.opts )
			.pipe( sass( global.config.sass.options ) )
			.pipe( gulpIf( data.autoprefixer, autoprefixer( global.config.autoprefixer.options ) ) )
			.pipe( gulpIf( data.nobase, rename( function ( path ) { path.dirname = ''; } ) ) )
			.pipe( gulp.dest( data.dest ) );
	};

	data.execute.displayName = data.task || 'Sass';
	return data;
};

action.less = function ( data ) {
	if ( !data || !data.src || !data.dest ) throw Error( 'Required parameter of "less" not specified (src, dest)' );

	data.execute = function () {
		if ( data.callback ) data.callback();
		gutil.log( 'Compile LESS:', gutil.colors.magenta( data.src ), '>>', gutil.colors.magenta( data.dest ) );
		return gulp.src( data.src, data.opts )
			.pipe( less( global.config.less.options ) )
			.pipe( gulpIf( global.config.autoprefixer.enable, autoprefixer( global.config.autoprefixer.options ) ) )
			.pipe( gulp.dest( data.dest ) );
	};

	data.execute.displayName = data.task || 'Less';
	return data;
};

action.jade = function ( data ) {
	if ( !data || !data.src || !data.dest ) throw Error( 'Required parameter of "jade" not specified (src, dest)' );

	data.execute = function () {
		if ( data.callback ) data.callback();
		gutil.log( 'Compile JADE:', gutil.colors.magenta( data.src ), '>>', gutil.colors.magenta( data.dest ) );
		return gulp.src( data.src, data.opts )
			.pipe( jade( global.config.jade.options ) )
			.pipe( gulp.dest( data.dest ) );
	};

	data.execute.displayName = data.task || 'Jade';
	return data;
};

action.minifyJs = function ( data ) {
	if ( !data || !data.src || !data.dest ) throw Error( 'Required parameter of "minifyJs" not specified (src, dest)' );

	data.execute = function () {
		if ( data.callback ) data.callback();
		gutil.log( 'Minify JS:', gutil.colors.magenta( data.src ), '>>', gutil.colors.magenta( data.dest ) );
		return gulp.src( data.src, data.opts )
			.pipe( babel( { presets: ['env'], comments: false, compact: true, minified: true, sourceType: 'script' } ) )
			.pipe( rename({ suffix: '.min' }) )
			.pipe( gulp.dest( data.dest ) );
	};

	data.execute.displayName = data.task || 'Jade';
	return data;
};

/**
 * Генерация оглавления (Table of contents) для css
 * по комментариям [\/** @group <имя_группы> *\/] и [\/** @section <имя_секции> *\/]
 * @param {object} data
 * @param {string} data.css - путь к syle.css
 * @param {string} data.scss - путь к syle.scss
 * @return {object} - правило
 */
action.genTOC = function ( data ) {
	if ( !data || !data.css || !data.scss ) throw Error( 'Required parameter of "genTOC" not specified (css, scss)' );

	data.execute = function ( end ) {
		let
			styles = fs.readFileSync( data.css, 'utf8' ),
			source = fs.readFileSync( data.scss, 'utf8' ),
			comments = styles.match( /\/\*\*(.|\s)*?\*\//g ),
			directivesRaw = [],
			directives = [],
			group = directives,
			string = '',

			parseComment = function( comment ) {
				let directive = comment.match( /^\/\*\*\s*?@(\w+?)\s+?(.*)\s*?\*\/$/ );

				if ( directive ) {
					directivesRaw.push({
						type: directive[1],
						value: directive[2].replace( /\s*$/, '' ),
					});
				}
			},

			procRawDirective = function( directive ) {
				if ( directive.type ) {
					if ( directive.type === 'group' ) {
						directive.group = [];
						directives.push( directive );
						group = directive.group;
					} else if ( directive.type === 'section' ) {
						group.push( directive );
					}
				}
			},

			genString = function( directives, depth = 1, index = 0 ) {
				for ( let i = 0; i < directives.length; i++ ) {
					let directive = directives[i], number = i + 1;
					string += ' * '+ '  '.repeat( depth ) + ( index ? index : '' ) + ( index && number ? '.' : '' ) + ( number ? number : '' ) +' '+ directive.value +'\n';
					if ( directive.group && directive.group.length ) genString( directive.group, depth + 1, number );
				}
			};

		if ( comments.length ) {
			comments.forEach( parseComment );
		} else {
			gutil.log( gutil.colors.red( `No comments of the form [\/** *\/] in the file ${data.css}` ) );
			end();
		}

		if ( directivesRaw.length ) {
			directivesRaw.forEach( procRawDirective );
		} else {
			gutil.log( gutil.colors.red( `No comments of the form [\/** @<type> <name> *\/] in the file ${data.css}` ) );
			end();
		}

		if ( directives.length ) {
			genString( directives );
		} else {
			gutil.log( gutil.colors.red( `No comments of the form [\/** @group <group_name> *\/] and [\/** @section <section_name> *\/] in the file ${data.css}` ) );
			end();
		}

		string = '/**\n * [Table of contents]\n'+ string +' */';
		source = source.replace( /\/\*\*(.|\s)*?\[Table of contents\](.|\s)*?\*\//, string );

		fs.writeFileSync( data.scss, source );
		end();
	};

	data.execute.displayName = data.task || 'generate css Table of contents';
	return data;
};

/**
 * Генерация пресетов для Novi билдера
 * @param {object} data
 * @param {string} data.html - glob выборка html-файлов
 * @param {string} data.builder - путь к корневому каталогу Novi билдера
 * @param {string} [data.task] - отображаемое имя задачи
 * @param {boolean} [data.debug] - отладочные логи
 * @todo существование папки 'elements'
 * @todo проверка одинаковых пресетов и генерация уникальных имен
 * @todo check
 */
action.genPresets = function ( data ) {
	if ( !data ) data = {};

	data.execute = function( end ) {
		// Выброс ошибки при отсутствии обязательных параметров задачи
		if ( !data || !data.html || !data.builder ) throw Error( `Required parameter of "genPresets" not specified (html, builder), get: ${JSON.stringify( data )}` );

		// Выброс ошибки при некорректном пути к билдеру или отсутствии файла настроек проекта билдера
		if ( !fs.existsSync( data.builder ) || !fs.existsSync( path.posix.join( data.builder, 'config/config.json' ) ) ) throw Error( `Wrong path to builder root: "${data.builder}"` );

		// Получение настроек проекта билдера
		let
			projectJson = JSON.parse( fs.readFileSync( path.posix.join( data.builder, 'projects/template/project.json' ), 'utf8' ) ),
			presetsArr = [],
			stats = {
				duplicateMarkup: 0,
				duplicateId: 0,
				missedImg: 0
			},

			comparePresets = function( presets, cb ) {
				presets.forEach( function( presetCurrent ) {
					if ( data.debug ) gutil.log( gutil.colors.gray( `proceed preset` ), gutil.colors.magenta( presetCurrent.name ), gutil.colors.gray( 'from page', presetCurrent.page ) );

					presetCurrent.isCurrent = true;

					presets.forEach( function( presetCompared, index ) {
						cb( presetCurrent, presetCompared, index, presets );
					});

					delete presetCurrent.isCurrent;
				});

				// Удаление пробелов в массиве
				return presets.filter( function( tmp ) { return true } );
			},

			genPresetName = function ( title, presets ) {
				let
					complete = false,
					counter = 0,
					name = title.toLowerCase().replace( / /g, '-' ),
					legal = name;

				if ( presets.length ) {
					while ( !complete ) {
						complete = true;

						for ( let i = 0; i < presets.length; i++ ) {
							if ( presets[i].name === legal ) {
								complete = false;
								counter++;
								legal = name +'-'+ counter;
							}
						}
					}
				}

				return legal;
			};

		// Получение и обработка содержимого файлов из glob выборки
		glob.sync( data.html ).forEach( function( filePath ) {
			if ( data.debug ) gutil.log( gutil.colors.gray( 'Processing page:' ), gutil.colors.magenta( filePath ) );

			// Получение и обработка содержимого файла (минификация, удаление DOCTYPE, генерация JSON из HTML)
			let htmlJson = util.getHtmlJson( filePath );

			// Получение всех пресетов из разметки
			util.procHtmlJson( htmlJson, function( json ) {
				if( json.node === 'element' && json.attr && json.attr.hasOwnProperty('data-preset') ) {
					// Разбор параметров пресета из атрибута
					let preset = JSON.parse( typeof( json.attr['data-preset'] ) === 'string' ? json.attr['data-preset'] : json.attr['data-preset'].join(' ') );

					// Выброс ошибки при отсутствии обязательных параметров пресета
					if ( !preset.title || !preset.category ) throw Error( `Missing required parameter of preset (title, category): ${preset}` );

					// Удаление атрибута data-preset из разметки пресета и добавление всех параметров
					delete json.attr['data-preset'];
					preset.template = prettyHtml( json2html( json ) );
					preset.name = preset.id ? preset.id : preset.title.toLowerCase().replace( / /g, '-' );
					preset.page = path.basename( filePath, '.html' );

					// Добавление сырого пресета в массив
					presetsArr.push( preset );
				}
			});
		});

		if ( data.debug ) gutil.log( gutil.colors.magenta( `Recived ${presetsArr.length} raw presets` ) );

		// Удаление дубликатов разметки
		if ( data.debug ) gutil.log( gutil.colors.gray( `Removing markup duplicates` ) );
		presetsArr = comparePresets( presetsArr, function( presetCurrent, presetCompared, index, presets ) {
			if ( !presetCompared.isCurrent && !presetCompared.id && presetCompared.template === presetCurrent.template ) {
				if ( data.debug ) gutil.log( gutil.colors.gray( '\tremoved' ), gutil.colors.red( presetCompared.name ), gutil.colors.gray( 'from page', presetCompared.page ) );
				delete presets[index];
				stats.duplicateMarkup++;
			}
		});

		// Удаление дублированных идентификаторов (остается только самый первый в массиве)
		if ( data.debug ) gutil.log( gutil.colors.gray( `Removing id duplicates (recived ${presetsArr.length} presets)` ) );
		presetsArr = comparePresets( presetsArr, function( presetCurrent, presetCompared, index, presets ) {
			if ( !presetCompared.isCurrent && presetCurrent.id && presetCompared.id === presetCurrent.id ) {
				if ( data.debug ) gutil.log( gutil.colors.gray( '\tremoved' ), gutil.colors.red( presetCompared.name ), gutil.colors.gray( 'from page', presetCompared.page ) );
				delete presets[index];
				stats.duplicateId++;
			}
		});

		// Финальная обработка пресетов
		presetsArr.forEach( function( preset ) {
			// Путь к будущему файлу с разметкой
			preset.path = `${preset.name}.html`;

			// Проверка параметра reload
			if ( !preset.reload ) preset.reload = false;

			// Добавление пути к картинке если она существует
			let imgPath = glob.sync( path.posix.join( data.builder, `projects/template/elements/${preset.name}.?(jpeg|jpg|png|gif|JPEG|JPG|PNG|GIF)` ) );
			if ( imgPath.length ) preset.preview = `elements/${preset.name}${path.extname( imgPath[0] )}`;
			else {
				if ( data.debug ) gutil.log( gutil.colors.gray( 'Missed image for' ), gutil.colors.red( preset.name ) );
				stats.missedImg++;
			}

			// Запись разметки в файл
			fs.writeFileSync( path.posix.join( data.builder, `projects/template/elements/${preset.path}` ), preset.template );

			// Удаление временных параметров пресета
			delete preset.id;
			delete preset.name;
			delete preset.template;
			delete preset.page;
		});

		// Замена исходных пресетов и перезапись project.json
		projectJson.presets = presetsArr;
		fs.writeFileSync( path.posix.join( data.builder, 'projects/template/project.json'), JSON.stringify( projectJson ) );

		// Вывод крадкой информации перед завершением
		gutil.log( gutil.colors.green( `Generated ${presetsArr.length} presets` ) );
		if ( stats.duplicateMarkup ) gutil.log( gutil.colors.yellow( `Skipped ${stats.duplicateMarkup} duplicates` ) );
		if ( stats.duplicateId ) gutil.log( gutil.colors.yellow( `Skipped ${stats.duplicateId} predefined ids` ) );
		if ( stats.missedImg ) gutil.log( gutil.colors.yellow( `Missed ${stats.missedImg} preset images` ) );
		if ( !data.debug ) gutil.log( gutil.colors.gray( 'For more information use `action.genPresets({ ... debug: true })`' ) );

		end();
	};

	data.execute.displayName = data.task || 'Generate Presets for Novi Builder';
	return data;
};

/**
 * Конвертация html-файлов в json и их обработка посредством колбека
 * @param {object} data
 * @param {string} data.src - glob выборка файлов
 * @param {function} data.callback
 * @param {string} [data.task] - отображаемое имя задачи
 * @param {boolean} [data.debug] - отладочные логи
 * @return {object} - правило
 * @todo {string} [data.dest] - путь для измененных файлов
 */
action.htmlAsJson = function ( data ) {
	if ( !data ) data = {};

	data.execute = function( end ) {
		// Выброс ошибки при отсутствии обязательных параметров задачи
		if ( !data || !data.src || !data.callback ) throw Error( `Required parameter of "htmlAsJson" not specified (src, callback), get: ${JSON.stringify( data )}` );

		// Если нет dest то обновить исходные файлы
		if ( !data.dest ) {
			if ( data.debug ) gutil.log( gutil.colors.yellow( 'Missing `data.dest`' ) );
			data.dest = data.src;
		}

		glob.sync( data.src ).forEach( function( filePath ) {
			if ( data.debug ) gutil.log( gutil.colors.gray( 'Processing page:', filePath ), gutil.colors.magenta( path.basename( filePath ) ) );

			// Получение и обработка содержимого файла (минификация, извлечение DOCTYPE, генерация JSON из HTML)
			let
				doctype = '<!DOCTYPE html>',
				htmlJson = util.getHtmlJson( filePath );

			util.procHtmlJson( htmlJson, data.callback );

			// Перезапись файла
			fs.writeFileSync( filePath, prettyHtml( doctype + json2html( htmlJson ) ) );
		});

		end();
	};

	data.execute.displayName = data.task || 'Proceed HTML as JSON';
	return data;
};

/**
 * Фильтрация всех ссылок в html-файлах, ссылки на несуществующие страницы заглушаются (#)
 * @param {object} data
 * @param {string} data.src - glob выборка файлов
 * @param {Array} [data.pages] - список страниц (без расширения)
 * @param {string} [data.task] - отображаемое имя задачи
 * @param {boolean} [data.debug] - отладочные логи
 * @return {object} - правило
 * @todo {string} [data.dest] - путь для измененных файлов
 */
action.filterLinks = function ( data ) {
	if ( !data ) data = {};

	data.execute = function( end ) {
		// Выброс ошибки при отсутствии обязательных параметров задачи
		if ( !data || !data.src ) throw Error( `Required parameter of "filterLinks" not specified (src), get: ${JSON.stringify( data )}` );

		let filesList = glob.sync( data.src );

		// Если не передан 'data.pages' то использовать список страниц из выборки файлов
		if ( !data.pages ) {
			if ( data.debug ) gutil.log( gutil.colors.yellow( 'Missing `data.pages`, use `data.src` glob' ) );
			data.pages = [];
			filesList.forEach( function( filePath ) {
				data.pages.push( path.basename( filePath, '.html' ) );
			});
		}

		if ( data.pages.length ) {
			filesList.forEach( function( filePath ) {
				if ( data.debug ) gutil.log( gutil.colors.gray( 'Processing page:', filePath ), gutil.colors.magenta( path.basename( filePath ) ) );

				// Проверка расширения и выброс ошибки
				if ( path.extname( filePath ) !== '.html' ) throw Error( `Not *.html file '${filePath}'` );

				// Получение и обработка содержимого файла (минификация, извлечение DOCTYPE, генерация JSON из HTML)
				let
					doctype = '<!DOCTYPE html>',
					htmlJson = util.getHtmlJson( filePath );

				util.procHtmlJson( htmlJson, function ( json ) {
					// Обработка ссылок в файле
					if( json.node === 'element' && json.tag === 'a' && json.attr.hasOwnProperty('href') && /\.html$/.test( json.attr.href ) ) {
						if ( !(new RegExp( `(${data.pages.join( '|' )})\\.html` )).test( json.attr.href ) ) {
							if ( data.debug ) gutil.log( gutil.colors.gray( 'Clean:' ), gutil.colors.red( json2html( json ) ) );
							json.attr.href = '#';
						} else {
							if ( data.debug ) gutil.log( gutil.colors.gray( 'Pass:', json2html( json ) ) );
						}
					}
				});

				// Перезапись файла
				fs.writeFileSync( filePath, prettyHtml( doctype + json2html( htmlJson ) ) );
			});
		} else if ( data.debug ) {
			gutil.log( gutil.colors.red( 'Empty glob =\'\(' ) );
		}

		end();
	};

	data.execute.displayName = data.task || 'Filter links';
	return data;
};

/**
 * Удаление части содержимого по маркерам
 * @param {object} data
 * @param {string} data.src - glob выборка файлов
 * @param {string} data.dest - конечный путь
 * @param {string} data.marker - имя маркера (допустимы цифры, буквы верхнего регистра и символ подчеркивания)
 * @param {object} [data.opts] - glob опции
 * @param {string} [data.task] - отображаемое имя задачи
 * @return {object} - правило
 *
 * @todo парсинг маркера
 * @todo LET- маркер
 * @todo комментарий #
 */
action.delMarker = function ( data ) {
	if ( !data || !data.src || !data.dest || !data.marker ) throw Error( `Required parameter of "delMarker" not specified (src, dest, marker), get ${data.src}` );

	data.execute = function () {
		gutil.log( 'Delete markers:', gutil.colors.magenta( data.src ), '>>', gutil.colors.magenta( data.dest ) );
		return gulp.src( data.src, data.opts )
			.pipe( insert.transform( function( content, file ) {
				let regExp = new RegExp( `\\s*\\/\\/\\{DEL.*?${data.marker}.*?\\}[^\\v]*?\\/\\/\\{DEL\\}`, 'g' );
				return content.replace( regExp, function() {
					gutil.log( gutil.colors.yellow( `DEL ${data.marker} at:` ), file.path );
					return '';
				}).replace( /\s*\/\/\{DEL.*?\}/g, '' );
			}))
			.pipe( gulp.dest( data.dest ) );
	};

	data.execute.displayName = data.task || `Delete markers ${data.marker}`;
	return data;
};

/**
 * Обновление списка страниц в project.json Novi билдера
 * @param {object} data
 * @param {string} data.builder - путь к корневому каталогу Novi билдера
 * @param {string} [data.task] - отображаемое имя задачи
 * @param {boolean} [data.debug] - отладочные логи
 */
action.genPages = function ( data ) {
	if ( !data ) data = {};

	data.execute = function( end ) {
		// Получение настроек проекта билдера и путей к страницам
		let
			projectJson = JSON.parse( fs.readFileSync( path.posix.join( data.builder, 'projects/template/project.json' ), 'utf8' ) ),
			files = glob.sync( path.posix.join( data.builder, 'projects/template/*.html' ) ),
			pagesArr = [],
			stats = {
				missedTitle: 0,
				missedPreview: 0
			};

		// Получение и обработка содержимого файлов из glob выборки
		files.forEach( function( filePath ) {
			let
				json = util.getHtmlJson ( filePath ),
				page = {};

			// Установка пути к файлу, главной и активной страницы
			page.path = path.basename( filePath );
			page.index = page.path === 'index.html';
			page.isActive = page.path === 'index.html';

			if ( data.debug ) gutil.log( gutil.colors.magenta( 'Page:', path.basename( page.path ) ) );

			// Обработка содержимого страницы в виде json
			util.procHtmlJson( json, function( json ) {
				// Получение заголовка
				if( json.node === 'element' && json.tag === 'title' && json.child ) {
					page.title = json.child[0].text;
				}
			});

			// Поиск изображения по имени страницы
			let existTest = glob.sync( path.resolve( data.builder, 'projects/template/novi/pages', path.basename( page.path, '.html' ) ) +'.?(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)' );

			if ( existTest.length ) {
				if ( data.debug ) gutil.log( gutil.colors.yellow( 'Found preview from page name' ) );
				page.preview = 'novi/pages/'+ path.basename( existTest[0] );
			}

			if ( !page.preview ) {
				if ( data.debug && !page.preview ) gutil.log( gutil.colors.red( 'Missed preview' ) );
				stats.missedPreview++;
			}

			if ( !page.title ) {
				if ( data.debug ) gutil.log( gutil.colors.red( 'Missed title' ) );
				stats.missedTitle++;
			}

			if ( data.debug ) gutil.log( gutil.colors.gray( JSON.stringify( page, null,2 ) ) );
			pagesArr.push( page );
		});

		// Замена исходных страниц и перезапись project.json
		projectJson.pages = pagesArr;
		fs.writeFileSync( path.posix.join( data.builder, 'projects/template/project.json'), JSON.stringify( projectJson ) );

		// Вывод крадкой информации перед завершением
		gutil.log( gutil.colors.green( `Generated ${pagesArr.length} pages` ) );
		if ( stats.missedTitle ) gutil.log( gutil.colors.yellow( `Missed ${stats.missedTitle} pages title` ) );
		if ( stats.missedPreview ) gutil.log( gutil.colors.yellow( `Missed ${stats.missedPreview} pages preview` ) );
		if ( !data.debug ) gutil.log( gutil.colors.gray( 'For more information use `action.genPages({ ... debug: true })`' ) );
		end();
	};

	data.execute.displayName = data.task || 'Generate pages';
	return data;
};

/**
 * Изменение параметров в json-файле
 * @param {object} data
 * @param {object} data.src - путь к json файлу
 * @param {function} data.callback - колбек для изменения параметров json
 * @param {string} [data.task] - отображаемое имя задачи
 */
action.procJson = function ( data ) {
	if ( !data || !data.src || !data.callback ) throw Error( `Required parameter of "procJson" not specified (src, callback), get ${data}` );

	data.execute = function( end ) {
		let json = JSON.parse( fs.readFileSync( data.src ) );
		json = data.callback( json );
		fs.writeFileSync( data.src, JSON.stringify( json ) );
		end();
	};

	data.execute.displayName = data.task || 'Proceed Json';
	return data;
};


module.exports = action;
