module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      target1: {
        files: {
          'js/all.min.js': [
            'js/IndexedDBShim.min.js',
            'js/idb.filesystem.js',
            'js/exif.js',
            'js/binaryajax.js',
            'js/megapix-image.js',
            'js/polypolyfile.js'
          ]
       }
      }
    },
    jshint: {
      files: ['gruntfile.js', 'js/polypolyfile.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('default', ['jshint', 'uglify']);

};
