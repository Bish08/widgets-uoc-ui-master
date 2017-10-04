/**
 * HPE Dataflow Configuration
 * 
 * This file defines all the angular services used by the widget.
 * A service defines some business logic to be used by controllers.
 */
define([
    'angular'   // load AngularJS
],
function(angular) {
    'use strict';
    return angular.module('hpeDataflowConfigurationServices', [])
        .service('hpeDataflowConfigurationService', ['$http', '$q', '$timeout',
            function($http, $q, $timeout) {

                // A service is a singleton. 
                // It can embed any kind of processes that should be shared between several components.
                
                this.generateAsynchronousError = function() {
                    var deferred = $q.defer();
                    $timeout(function() {
                        if(1 !== 2) {
                            deferred.reject('generated error');
                        } else {
                            deferred.resolve('OK');
                        }
                    }, 1000);
                    return deferred.promise;
                };

                this.someBusinessLogic = function() {
                    //TBD
                };
            }
        ]);
});
