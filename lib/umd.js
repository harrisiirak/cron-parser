(function(root, factory){

  var CronParser = factory();

  if (typeof module !== 'undefined' && module.exports){
    module.exports = CronParser;
  }

  if (typeof window !== 'undefined' && this === window){
    window.CronParser = CronParser;
  }

}(this, function(){
  
  // import ./date.js
  // import ./expression.js
  // import ./parser.js

  return CronParser;
}));