var fs = require("fs");
var envify = require("envify/custom");

module.exports = function(grunt) {
  grunt.initConfig({
    mochaTest: {
      test: {
        src: ["test/*.spec.js"]
      }
    },
    envify: {
      dev: {
        env: {
          NODE_ENV: "development"
        },
        input: "seamless-immutable.js",
        output: "seamless-immutable.development.js"
      },
      prod: {
        env: {
          NODE_ENV: "production"
        },
        input: "seamless-immutable.js",
        output: "seamless-immutable.production.js"
      }
    }
  });

  grunt.loadNpmTasks("grunt-mocha-test");

  grunt.registerMultiTask("envify", "Envifies a source file to a target file", function() {
    var inputStream = fs.createReadStream(this.data.input);
    var outputStream = fs.createWriteStream(this.data.output);

    var done = this.async();

    inputStream
      .pipe(envify(this.data.env)())
      .pipe(outputStream)
      .on("finish", done);
  });

  grunt.registerTask("test", "mochaTest");
  grunt.registerTask("build", ["envify"]);
  grunt.registerTask("default", ["build", "test"]);
};
