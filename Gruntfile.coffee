module.exports = (grunt) ->

  banner = [
    '/**!'
    ' * <%= pkg.description %>'
    ' * @project <%= pkg.name %>'
    ' * @author <%= pkg.author.name %> <<%= pkg.author.email %>>'
    ' * @link <%= pkg.homepage %>'
    ' * @link <%= pkg.repository.url %>'
    ' * @copyright <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>'
    ' * @license <%= pkg.license %>'
    ' * @version <%= pkg.version %>'
    ' */\n'
  ]

  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    jshint:
      options:
        jshintrc: '.jshintrc'
      files: [
        'jquery.signaturepad.js'
      ]

    uglify:
      minifiy:
        options:
          banner: banner.join('\n')
          mangle: false
          compress: true
          preserveComments: 'some'
        files:
          'jquery.signaturepad.min.js': [
            'jquery.signaturepad.js'
          ]

  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-uglify'

  grunt.registerTask 'default', [
    'jshint'
    'uglify'
  ]
