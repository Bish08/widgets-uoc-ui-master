/**
 * RestAPI URL list
 */
define([
        'angular',
        'commons/constants',
        'commons/restapi/commons-restapi',
        'components/message-notifier/message-notifier-services'
    ],
     
    function(angular, constants) {
        'use strict';
        return angular.module('dataflowRestapi', [])
            .service('dataflowRestapiService', [ function() {
                  var baseUrl = 'http://acirosps.eu.hpecorp.net:8181/dataflowAPI-0.0.1'
                    this.restapi = {
                        dataflowManagement: {                         
                            GET_ALL: baseUrl+'/get-all',
                            GET_BY_ID: baseUrl+'/get-by-id',
                            GET_BY_TASPS_ID: baseUrl+'/get-by-tasps-id',
                            CREATE: baseUrl+'/create',
                            DELETE: baseUrl+'/delete',
                            UPDATE_STATUS_BY_TASPS_ID: baseUrl+'/update-status-by-tasps',
                            UPDATE: baseUrl+'/update',
                            GET_MONITOR_STATUS : baseUrl +'/module-status/get-by-module',
                            GET_LOGS : baseUrl +'/monitorlogs/get',
                            GET_VALUEPACK_LIST : baseUrl +'/value-pack/get-all',
                            GET_TASPS_LIST:  'http://acirosps.eu.hpecorp.net:3000/V1.0/domains/plugin_spsdal/getTaskMgmt/1000/1'

                        }
                    };

                     
                    this.displayErrorMsg = function(data, status) {
                        var errorMsg = "";
                        if (data && data.msg) {
                            errorMsg = data.msg;
                        } else {
                            switch(status) {
                                case 400:
                                    // Bad request - Connection refused
                                    errorMsg = "Error: Dataflow server is unavailable";
                                    break;
                                case 401:
                                    // Unauthorized
                                    errorMsg = "UOC session expired, please login";
                                    break;
                                case 500:
                                    // Internal Server Error
                                    errorMsg = "Internal SPS DAL server error";
                                    break;
                                case 0:
                                    // Network: connection refused
                                    errorMsg = "Error: UOC server is unavailable";
                                    break;
                                default:
                                    // Internal error, origin unknown
                                    errorMsg = "Internal Dataflow server error";
                            }
                        }
                        var timestamp = new Date();
                        messageNotifierService.error(timestamp.toLocaleString() + ' - ' + errorMsg);
                    };
                }
            ]);
    });
