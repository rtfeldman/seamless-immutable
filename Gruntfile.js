module.exports = function(grunt) {
  grunt.initConfig({
    mochaTest: {
      test: {
        src: ["test/*.spec.js"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-mocha-test");

  grunt.registerTask("test", "mochaTest");
  grunt.registerTask("default", ["test"]);
};
