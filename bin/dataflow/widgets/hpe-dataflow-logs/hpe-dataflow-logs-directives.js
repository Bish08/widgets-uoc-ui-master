/**
 * HPE Dataflow Logs
 * 
 * This file defines all the angular directives used by the widget.
 * A directive corresponds to a new HTML tag. 
 * It binds an HTML template with a controller and optionally a CSS stylesheet.
 */
define([
    'angular',                                                  // load AngularJS
    'addons/dataflow/widgets/hpe-dataflow-logs/hpe-dataflow-logs-controllers', // load the widget's controllers
    'css!addons/dataflow/widgets/hpe-dataflow-logs/hpe-dataflow-logs.css',      // load the CSS stylesheet with require
    'css!addons/dataflow/widgets/hpe-dataflow-logs/datatables.css'      // load the CSS stylesheet with require
], 
function(angular) {
    'use strict';
    return angular.module('hpeDataflowLogsDirectives', ['hpeDataflowLogsControllers'])
        .directive('hpeDataflowLogs', function() { // the tag name is defined in camel case, but will be used in snake case (<hpe-hello-world><hpe-hello-world/>)
            return {
                restrict: 'E',
                replace: true,
                controller: 'hpeDataflowLogsController',   // controller to be used
                templateUrl: 'addons/dataflow/widgets/hpe-dataflow-logs/hpe-dataflow-logs.html'
            };
        });
});
