var mapping = {
	styles: ['css', 'less', 'scss', 'styl'],
	scripts: ['js', 'jsx', 'es6', 'es', 'coffee'],
	templates: ['jade', 'json', 'html', 'htm'],
	images: ['jpg', 'jpeg', 'png', 'svg']
}


module.exports = function(gulp, config, watch) {

	if(config.mapping) {
		Object.keys(config.mapping).forEach(function(key) {
			mapping[key] = config.mapping[key]
		})
	}

	var fileExtensions = ['css','styl','scss','less','js','jsx','es6','es','coffee','jade','json','html','htm']
	Object.keys(mapping).forEach(function(key) {
		mapping[key] = mapping[key].map(function(i) {
			var ext = '.' + i.replace(/^\./, '') // remove . from the beginning of the string
			if(fileExtensions.indexOf(key) == -1) {
				fileExtensions.push(ext.substring(1))
			}
			return new RegExp(ext + '$')
		})
	})

	return function(done) {
		var c = require('better-console')
		c.info('Watching sources for change and recompilation...')

		var minimatch = require('minimatch')
		var path = require('path')
		var runcmd = require('../helpers/runcmd')
		var glob = '**/*.{' + fileExtensions.join() + '}'
		var globDist = config.dist_folder + '/**/*.*'



		var completeHandler = function(e) {
			if(config.hooks && config.hooks.watch) runcmd(config.hooks.watch)
		}

		var changeHandler = function(filepath) {
			// Filter dist sources
			if (minimatch(filepath, globDist)) {
				return
			}

			config._lastChanged = filepath

			var handlers = []

			Object.keys(mapping).forEach(function (key) {

				mapping[key].forEach(function(regexp) {
					if(filepath.match(regexp)) {
						handlers.push(key)
					}
				})
			})

			if (!handlers.length) {
				c.warn('! unknown extension', path.extname(filepath), filepath)
				return
			}

			handlers.forEach(function(handler) {
				gulp.start(handler, completeHandler)
			})


		}

		watch(glob, changeHandler)

		done()
	}
}
