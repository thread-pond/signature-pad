#! /usr/local/bin/node

var fs = require('fs')
	,exec = require('child_process').exec
	,jshint = require('jshint').JSHINT

process.stdout.write('JSHinting... ')

var jshintrc = JSON.parse(fs.readFileSync('.jshintrc', 'utf8'))
	,source = fs.readFileSync('src/jquery.signaturepad.js', 'utf8')
	,valid = jshint(source, jshintrc)

if(valid)
{
	process.stdout.write('done.\nMinifying... ')

	exec('java -jar ~/bin/compiler.jar --js src/jquery.signaturepad.js --js_output_file assets/jquery.signaturepad.min.js'
		,function(err, stdout, stderr){
			process.stdout.write('done.\n')
	})
}
else
{
	var e = null

	console.log('\nJSHint failed with errors:')

	for(var i=0, t=jshint.errors.length; i<t; i++)
	{
		e = jshint.errors[i]
		console.log('• Line: ' + e.line + ' Col: ' + e.character + '; ' + e.reason)
	}

	console.log('Build incomplete.')
}
