/**
 * HPE Dataflow Configuration
 * 
 * This file defines all the angular directives used by the widget.
 * A directive corresponds to a new HTML tag. 
 * It binds an HTML template with a controller and optionally a CSS stylesheet.
 */
define([
    'angular',                                                  // load AngularJS
    'addons/dataflow/widgets/hpe-dataflow-configuration/hpe-dataflow-configuration-controllers', // load the widget's controllers
    'css!addons/dataflow/widgets/hpe-dataflow-configuration/hpe-dataflow-configuration.css'      // load the CSS stylesheet with require
], 
function(angular) {
    'use strict';
    return angular.module('hpeDataflowConfigurationDirectives', ['hpeDataflowConfigurationControllers'])
        .directive('hpeDataflowConfiguration', function() { // the tag name is defined in camel case, but will be used in snake case (<hpe-hello-world><hpe-hello-world/>)
            return {
                restrict: 'E',
                replace: true,
                controller: 'hpeDataflowConfigurationController',   // controller to be used
                templateUrl: 'addons/dataflow/widgets/hpe-dataflow-configuration/hpe-dataflow-configuration.html'
            };
        });
});
