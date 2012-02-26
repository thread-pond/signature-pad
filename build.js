#!/usr/bin/env node

/*
 * Module dependencies
 */
var fs = require('fs')
  , exec = require('child_process').exec
  , jshint = require('jshint').JSHINT

var jshintrc = JSON.parse(fs.readFileSync('.jshintrc', 'utf8'))
  , sigPadPath = 'jquery.signaturepad.js'
  , sigPadMinPath = 'build/jquery.signaturepad.min.js'
  , source = fs.readFileSync(sigPadPath, 'utf8')
  , valid = jshint(source, jshintrc)

process.stdout.write('JSHinting... ')

if (valid) {
  process.stdout.write('done.\nMinifying... ')

  exec('java -jar ~/bin/compiler.jar --js ' + sigPadPath + ' --js_output_file ' + sigPadMinPath
    , function(err, stdout, stderr) {
      var sp = fs.readFileSync(sigPadMinPath, 'utf8')
        , ver = fs.readFileSync('VERSION.txt', 'utf8')
        , spVer = sp.replace(/{{version}}/, ver.trim())

      fs.writeFileSync(sigPadMinPath, spVer)

      process.stdout.write('done.\n')
  })
} else {
  var e = null

  console.log('\nJSHint failed with errors:')

  for (var i = 0, t = jshint.errors.length; i < t; i++) {
    e = jshint.errors[i]
    console.log('• Line: ' + e.line + ' Col: ' + e.character + '; ' + e.reason)
  }

  console.log('Build incomplete.')
}
