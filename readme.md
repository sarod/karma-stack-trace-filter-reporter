
# Project Status
*This project is not maintained.*

# Overview
Karma reporter allowing to filter out stack traces lines based on regex or maximum number of lines


This project is not published as a npm package so you need to copy it to your project manually and import it in your karma.conf.js using path to the file

#Example karma.conf.js
```js
var StackTraceFilterReporter = require('./src/karma-stack-trace-filter-reporter.js');

module.exports = function (config) {
   config.set({
      // ... standard karma cnnfig
      plugins: ['karma-*', {
         'reporter:stack-trace-filter': ['type', StackTraceFilterReporter]
      }],
      reporters: [
      // ... oher reporters to use before e.g 'jasmine-diff'
      'stack-trace-filter',
      // ... oher reporters to use before e.g 'mocha'
      ],

      // configure stack trace filter
      stackTraceFilterReporter: {
         excludeStackLinesRegex: '.*jasmine.js.*',
         maxLines: 5
      }
   });
};


```