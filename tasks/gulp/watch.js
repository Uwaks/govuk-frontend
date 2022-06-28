'use strict'
const { watch, series, parallel } = require('gulp')
const configPaths = require('../../config/paths.json')
const { startSassdoc } = require('./sassdoc.js')

// Watch task ----------------------------
// When a file is changed, re-run the build task.
// ---------------------------------------
function watchFiles () {
  watch([configPaths.src + '**/**/*.scss', configPaths.app + 'assets/scss/**/*.scss', configPaths.fullPageExamples + '**/*.scss'], parallel('styles', startSassdoc))
  watch([configPaths.src + '**/**/*.mjs'], series('scripts'))
}

exports.watchFiles = watchFiles
