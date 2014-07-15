/* $ npm run build */

module.exports = {
  
  'import': {
    files: 'lib/umd.js',
    output: 'dist/cron-parser.js'
  },
  
  'jshint': {
    files: ['dist/cron-parser.js'],
    jshint: JSHint()
  },
  
  'uglify': {
    files: 'dist/cron-parser.js'
  },
  
  'watch': {
    files: 'lib/**',
    actions: ['import']
  },
  
  'defaults': ['import', 'jshint', 'uglify']
};


function JSHint() {
  
  var options = {
      "bitwise": false,
      "camelcase": false,
      "curly": false,
      "eqeqeq": true,
      "es3": false,
      "forin": false,
      "freeze": false,
      "immed": true,
      "indent": 2,
      "latedef": "nofunc",
      "newcap": false,
      "noarg": true,
      "noempty": true,
      "nonbsp": true,
      "nonew": false,
      "plusplus": false,
      "quotmark": false,
      "undef": true,
      "unused": false,
      "strict": false,
      "trailing": false,
      "maxparams": false,
      "maxdepth": false,
      "maxstatements": false,
      "maxcomplexity": false,
      "maxlen": false,
      "asi": false,
      "boss": true,
      "debug": true,
      "eqnull": true,
      "esnext": true,
      "evil": true,
      "expr": false,
      "funcscope": false,
      "gcl": false,
      "globalstrict": true,
      "iterator": false,
      "lastsemic": true,
      "laxbreak": true,
      "laxcomma": true,
      "loopfunc": false,
      "maxerr": false,
      "moz": false,
      "multistr": true,
      "notypeof": false,
      "proto": true,
      "scripturl": false,
      "smarttabs": true,
      "shadow": true,
      "sub": true,
      "supernew": true,
      "validthis": true,
      "noyield": false,
      "browser": true,
      "couch": false,
      "devel": false,
      "dojo": false,
      "jquery": true,
      "mootools": false,
      "node": true,
      "nonstandard": false,
      "phantom": false,
      "prototypejs": false,
      "rhino": false,
      "worker": false,
      "wsh": false,
      "yui": false,
      "nomen": false,
      "onevar": false,
      "passfail": false,
      "white": false,
      "predef": ["global", "define"]
    }
  return {
    options: options,
    globals: options.predef
  };
}
