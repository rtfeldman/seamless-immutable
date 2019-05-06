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
        input: "src/seamless-immutable.js",
        output: "seamless-immutable.development.js"
      },
      prod: {
        env: {
          NODE_ENV: "production"
        },
        input: "src/seamless-immutable.js",
        output: "seamless-immutable.production.js"
      }
    },
    uglify: {
      options: {
        banner: '/* (c) 2017, Richard Feldman, github.com/rtfeldman/seamless-immutable/blob/master/LICENSE */'
      },
      min: {
        files: {
          "seamless-immutable.development.min.js": ["seamless-immutable.development.js"],
          "seamless-immutable.production.min.js": ["seamless-immutable.production.js"]
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-mocha-test");
  grunt.loadNpmTasks("grunt-contrib-uglify");

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
  grunt.registerTask("build", ["envify", "uglify"]);
  grunt.registerTask("default", ["build", "test"]);
};
