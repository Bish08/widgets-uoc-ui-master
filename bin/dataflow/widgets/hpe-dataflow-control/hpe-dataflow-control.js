/**
 * HPE hello world example module
 * 
 * This file defines all the dependencies needed by the widget.
 * It is called to load the widget in UOC's widget library.
 * This file's name must be the widget's directory's name plus the extension '.js'.
 */
define([ // define a require module, and list its dependencies
    'angular',                                                  // load AngularJS
    'components/language-config/language-config',               // load common internationalization control
    'addons/dataflow/widgets/hpe-dataflow-control/hpe-dataflow-control-directives'   // load the widget's directives
],
function(angular) {
    'use strict';
    // define an angular module and list its angular dependencies
    var hpeDataflowControlWidget = angular.module('hpeDataflowControl', [ // module name should be the directories name in camel case
        'hpeDataflowControlDirectives',
        'pascalprecht.translate'
    ]);
    hpeDataflowControlWidget.run(['$translatePartialLoader',
        function($translatePartialLoader) {
            // Load module translation data
            $translatePartialLoader.addPart('/addons/dataflow/widgets/hpe-dataflow-control');
        }
    ]);
    return hpeDataflowControlWidget;
});
