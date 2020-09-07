const
	action = require( 'tempaw-functions' ).action,
	preset = require( 'tempaw-functions' ).preset;

module.exports = {
	livedemo: {
		enable: true,
		server: {
			baseDir: "dev/",
			directory: false
		},
		port: 8000,
		open: false,
		notify: true,
		reloadDelay: 0,
		ghostMode: {
			clicks: false,
			forms: false,
			scroll: false
		}
	},
	sass: {
		enable: true,
		showTask: false,
		watch: `dev/scss/**/*.scss`,
		source: [`dev/scss/custom-styles/!(_).scss`, `dev/scss/bootstrap/bootstrap.scss`],
		dest: 'dev/css/',
		options: {
			outputStyle: 'expanded',
			indentType: 'tab',
			indentWidth: 1,
			linefeed: 'cr'
		}
	},
	less: {
		enable: false,
		showTask: false,
		watch: 'dev/less/**/*.less',
		source: 'dev/less/style.less',
		dest: 'dev/css/'
	},
	pug: {
		enable: true,
		showTask: false,
		watch: 'dev/pug/**/*.pug',
		source: 'dev/pug/pages/!(_)*.pug',
		dest: 'dev/',
		options: {
			pretty: true,
			verbose: true,
			emitty: true
		}
	},
	jade: {
		enable: false,
		showTask: false,
		watch: 'dev/jade/**/*.jade',
		source: 'dev/jade/pages/!(_)*.jade',
		dest: 'dev/',
		options: {
			pretty: true
		}
	},
	babel: {
		enable: false,
		watch: 'dev/babel/**/!(_)*.js',
		source: 'dev/babel/!(_)*.js',
		dest: 'dev/js/',
		options: {
			presets: ['env'],
			comments: false,
			compact: true,
			minified: true,
			sourceType: 'script'
		},
		alternate: {
			sourcemaps: false
		}
	},
	autoprefixer: {
		enable: false,
		options: {
			cascade: true,
			browsers: ['Chrome >= 45', 'Firefox ESR', 'Edge >= 12', 'Explorer >= 10', 'iOS >= 9', 'Safari >= 9', 'Android >= 4.4', 'Opera >= 30']
		}
	},
	watcher: {
		enable: true,
		watch: 'dev/js/**/*.js'
	},
	htmlValidate: {
		showTask: true,
		source: 'dev/*.html',
		report: 'dev/'
	},
	jadeToPug: {
		showTask: false,
		source: 'dev/jade/**/*.jade',
		dest: 'dev/pug/'
	},
	lessToScss: {
		showTask: false,
		source: 'dev/less/**/*.less',
		dest: 'dev/scss/'
	},
	cache: {
		showTask: false,
	},
	buildRules: {
		'build-TM': [
			preset.buildMonster({
				clean: true,
				livedemo: true,
				granter: true,
				builder: false,
				project: true,
				granterPsd: false,
				minifyimg: true
			})
		],
		'build-TF': [
			preset.buildForest({
				clean: true,
				livedemo: true,
				userPackage: true,
				project: true,
				minifyimg: true,
				placeholder: {
					exclusions: [
						'_blank',
						'gmap*',
						'logo*',
						'sprite*',
						'warning_bar_0000_us',
						'isotope-loader',
						'mCSB_buttons',
						'preloader',
						'video-play',
						'vimeo-play',
						'youtube-play'
					]
				}
			})
		],
		'build-advanced': [
			// Distributive
			action.clean({ // Clean dist
				enable: true,
				src:`fake/!(.)*`
			}),
			preset.buildLiveDemo({ // Live Demo
				enable: true,
				src: 'dev',
				dest: 'fake/livedemo',
				minifyimg: true
			}),
			preset.buildGranter({ // Granter
				enable: true,
				src: 'dev',
				dest: {
					site: 'fake/granter/site',
					sources: 'fake/granter/sources'
				},
				minifyimg: true,
			}),
			preset.buildUserPackage({ // User Package
				enable: true,
				src: 'dev',
				dest: 'fake/user-package',
				minifyimg: true,
				placeholder: {
					bgColor: '#000',
					textColor: '#a09',
					exclusions: [
						'_blank',
						'gmap*',
						'logo*',
						'sprite*',
						'warning_bar_0000_us',
						'isotope-loader',
						'mCSB_buttons',
						'preloader',
						'video-play',
						'vimeo-play',
						'youtube-play'
					]
				}
			}),
			action.copy({ // PSD
				enable: true,
				src: `sources/psd/**/*.psd`,
				dest: `dist/granter/sources/psd/`
			}),
			action.copy({ // Icon
				enable: true,
				src: `sources/psd/*.ico`,
				dest: `dist/granter/sources/psd/`
			}),
			action.copy({ // TF Documentation
				enable: true,
				src: `sources/documentation/*.*`,
				dest: `dist/user-package/documentation/`
			}),
			action.copy({ // TF Documentation
				enable: true,
				src: `sources/documentation/!(scss|pug)/**/*`,
				dest: `dist/user-package/documentation/`
			}),
			// Dev Project
			action.copy({ // full dev folder
				enable: true,
				src: `dev/**/*`,
				dest: `dist/project/dev/`
			}),
			action.copy({ // full tf documentation
				enable: true,
				src: `sources/documentation/**/*`,
				dest: `dist/project/sources/documentation/`
			}),
			action.copy({ // dev files
				enable: true,
				src: [
					`package.json`,
					`gulpfile.js`,
					`config.js`,
					`prepros-6.config`,
				],
				dest: `dist/project/`
			})
		],
		'update-bs4': [
			preset.updBs4({
				general: true,
				offsets: false
			})
		],
		'bulder-throw-in': [
			action.copy({ src:`dev/*.html`,               dest:'builder/projects/template/' }),
			action.copy({ src:`dev/css/*.css`,            dest:'builder/projects/template/css/' }),
			action.copy({ src:`dev/js/*.js`,              dest:'builder/projects/template/js/' }),
			action.copy({ src:`dev/special/project.json`, dest:'builder/projects/template/' })
		],
		'builder-get-from': [
			action.clean({ src:`dev/special/elements/` }),
			action.copy({ src:'builder/projects/template/project.json',     dest:`dev/special/` }),
			action.copy({ src:'builder/projects/template/elements/**/*',    dest:`dev/special/elements/` }),
			action.copy({ src:'builder/projects/template/.novi/media/**/*', dest:`dev/special/media/` })
		],
		'util-backup': [
			action.pack({
				src: [ 'dev/**/*', '*.*' ], dest: 'versions/',
				name( dateTime ) { return `backup-${dateTime[0]}-${dateTime[1]}.zip`; }
			})
		]
	}
};
