'use strict';
var reporterName = 'stack-trace-filter';

function StackTraceFilterReporter(baseReporterDecorator, config, logger) {
   // Extend Karma Base reporter
   baseReporterDecorator(this);

   var defaultReporterConfig = {
      maxLines: -1,
      excludeStackLinesRegex: []
   };
   log('-----StackTraceFilterReporter-----');
   log('config.stackTraceFilterReporter:', JSON.stringify(config.stackTraceFilterReporter));
   var reporterOptions = normalizeReporterConfig(config.stackTraceFilterReporter, defaultReporterConfig);
   log('normalizedOptions:', JSON.stringify(reporterOptions));

   // Override Base reporter method
   // Replace original message with stack trace stripped one
   var hasTrailingReporters = config.reporters.slice(-1).pop() !== reporterName;
   var originalSpecFailure = this.specFailure;
   this.specFailure = function specFailure(browser, result) {

      // Remove stack trace
      result.log = result.log.map(function (message) {
         return buildFilteredStackTraceMessage(message);
      });

      // If reporter is last in the list of reporters from config
      // then invoke Karma's Base reporter. Basically this reporter
      // just changes the message, but does not output info by itself,
      // so one could use any reporter and still have highlighted diff.
      if (!hasTrailingReporters) {
         originalSpecFailure.call(this, browser, result);
      }
   };

   function buildFilteredStackTraceMessage(message) {
      var stackTraceStartIndex = stackTraceStart(message);

      var baseMessage
      var stackMessage;
      if (stackTraceStartIndex !== -1) {
         baseMessage = message.substr(0, stackTraceStartIndex);
         stackMessage = message.substr(stackTraceStartIndex, message.length);
      } else {
         baseMessage = message;
         stackMessage = '';
      }
      return baseMessage + filterStackTraceMessage(stackMessage);
   }

   function stackTraceStart(message) {
      // Naive implementation of stack trace lloking for last .\n
      var dotIndex = message.lastIndexOf('.\n');
      if (dotIndex === -1) {
         return -1;
      }
      return dotIndex + 2;
   }

   function filterStackTraceMessage(originalStackMessage) {
      if (reporterOptions.maxLines === 0) {
         // Optimization quick return
         return '';
      }

      var stackLines = originalStackMessage.split('\n');

      if (reporterOptions.excludeStackLinesRegex.length > 0) {
         var excludeRegexes = reporterOptions.excludeStackLinesRegex;
         stackLines = stackLines.filter(function (line) {
            return !matchesAnyRegexes(line, excludeRegexes);
         });
      }

      if (reporterOptions.maxLines > 0) {
         stackLines = stackLines.slice(0, reporterOptions.maxLines);
      }
      return stackLines.join('\n');
   }

   function matchesAnyRegexes(line, excludeRegexes) {
      return excludeRegexes.some(function (regex) {
         var test = regex.test(line);
         return test;
      });
   }

   function normalizeReporterConfig(userConfig, defaultReporterConfig) {
      var normalized = Object.assign({}, defaultReporterConfig);
      if (userConfig) {
         if (userConfig.maxLines !== undefined) {
            normalized.maxLines = userConfig.maxLines;
         }
         if (userConfig.excludeStackLinesRegex !== undefined) {
            log(userConfig.excludeStackLinesRegex);

            var regexes = Array.isArray(userConfig.excludeStackLinesRegex) ?
                  userConfig.excludeStackLinesRegex : [userConfig.excludeStackLinesRegex];
            log(regexes);
            normalized.excludeStackLinesRegex = regexes.map(function (regexPattern) {
               var regExp = new RegExp(regexPattern);
               regExp.toJSON = function () {
                  return regexPattern;
               }
               return regExp;
            });
         }
      }
      return normalized;
   }

   function log() {
      if (StackTraceFilterReporter.LOG) {
         console.log.apply(console, arguments);
      }
   }

}

StackTraceFilterReporter.$inject = ['baseReporterDecorator', 'config', 'logger'];
StackTraceFilterReporter.LOG = false;

module.exports = StackTraceFilterReporter;

