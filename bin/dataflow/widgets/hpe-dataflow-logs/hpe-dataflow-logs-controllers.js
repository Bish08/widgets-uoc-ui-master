/**
 * HPE Dataflow Logs controllers
 * 
 * This file defines all the angular controllers used by the widget.
 * A controller corresponds to user interaction logic, and UI-model modification.
 * 
 */
define([
    'angular',                                                  // load AngularJS
    'lodash',                                                   // load lodash to be used to simply some calculations
    'addons/dataflow/widgets/hpe-dataflow-logs/hpe-dataflow-logs-services',    // load the widget's services
    'components/data-access/data-access-services',              // load the common service used to get data after having selected a combination of dimensions, facts and filters.
    'commons/events/commons-events',                            // load the common events of UOC platform
    'components/data-exchange/data-exchange-services',          // load the common data exchange service. It is used for the communication between widgets inside a workspace. A widget can listen to changes of exchanged data and behave consequently.
    'components/message-notifier/message-notifier-services',     // load the common notification service (used to notify errors)
    'addons/dataflow/widgets/hpe-dataflow-logs/datatables',    // load datatables
    'addons/spsdal/services/spsdal-communicator-services',
    'addons/dataflow/services/dataflow-restapi'
], 
function(angular, _) { // inject angular and lodash (then lodash can be used with _.method...)
    'use strict';
    return angular.module('hpeDataflowLogsControllers', ['hpeDataflowLogsServices', 'dataAccessServices', 'commonsEvents', 'dataExchangeServices', 'messageNotifierServices', 'dataflowRestapi'])
        .controller('hpeDataflowLogsController', ['$scope', '$http', '$rootScope', '$log', '$filter', '$timeout', '$q', 'messageNotifierService', 'hpeDataflowLogsService', 'events',  'dataAccessService',  'dataExchangeService', 'dataflowRestapiService', function($scope, $http , $rootScope, $log, $filter, $timeout, $q, messageNotifierService, hpeDataflowLogsService, events, dataAccessService, dataExchangeService, dataflowRestapiService) {
        	var logger = $log.getInstance('hpeDataflowLogsController');
        
        	
$http({
    method: 'GET',
    url: dataflowRestapiService.restapi.dataflowManagement.GET_TASPS_LIST
}).success(function (result) {

 var taspsList = [];
 
for(var i in result.rows) {    

var item = result.rows[i];   

taspsList.push({ 
    id : item.uid,
    label  : item.L7dName[0].displayString
});
}

	$scope.taspsList = taspsList;
});
 
$scope.convertToInt = function(id){
    return parseInt(id, 10);
};


// jQuery - Reload Data, Load Data, Update Load Date, Update Dataflow
$(document).ready(function () {
	var today = new Date();
	var yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 7);
	var dd = yesterday.getDate();
	var mm = yesterday.getMonth()+1; //January is 0!

	var yyyy = yesterday.getFullYear();
	if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} 
	yesterday = yyyy+"-"+mm+"-"+dd;
	
	document.getElementById('reloadLogs').addEventListener('click', function() {
	console.log("Reload Data table");
	$('#dataflowLogstable').DataTable().ajax.reload();
	}, false);

  var urlCreate = dataflowRestapiService.restapi.dataflowManagement.GET_LOGS;
  console.log("Load dataflows");
   $('#dataflowLogstable').DataTable(
	   
				{
				"ajax" : {
					"url" : urlCreate,
					"dataSrc" : "",
					"type": "POST",
					"beforeSend": function (request) {
			        request.setRequestHeader("Content-Type", "application/json");
			    },
			    "contentType": "application/json",
	               "data": function ( d ) {
	            	    return JSON.stringify({"date_from" : yesterday});
	            	    }
	           },  
					"columns" : [ 
    				{
        			"data" : "DATED"
    				},
					{
                        "render" : function(
							data, type, row) {
						if (row.DATAFLOW_ID != null)
							return row.DATAFLOW_ID;
								else 
							return "";
						}
					},
					{         	  
					"render" : function(
						data, type, row) {
					if (row.TASPS_ID != null)
						return row.TASPS_ID;
							else 
						return "";
					}
					},
                          {
//                        	  DATAFLOW_MANUALLY_TRIGGERED=0 
//                        	  DATAFLOW_FILES_AV_TRIGGERED=1
//                        	  DATAFLOW_CHECK_DEPENDECIES_TRIGGERED=2
//                        	  DATAFLOW_COMPLETED=3
//                        	  DATAFLOW_ERROR=4
//                        	  INCREMENT_LOAD_DATE=5
//                        	  EDIT_LOAD_DATE=6
//                        	  START_MONITORING=7
//                        	  STOP_MONITORING=8 
                        "render" : function(
							data, type, row) {
						if (row.EVENT_TYPE == "0")
							return "Manually Triggered";
						else if (row.EVENT_TYPE == "1")
							return "File Availability Triggered"
						else if (row.EVENT_TYPE == "2")
							return "All Dependencies Triggered"
						else if (row.EVENT_TYPE == "3")
							return "Dataflow Completed"
						else if (row.EVENT_TYPE == "4")
							return "Dataflow Error"	
						else if (row.EVENT_TYPE == "5")
							return "Increment Load Date"
						else if (row.EVENT_TYPE == "6")
							return "Edit Load Date / Dataflow"
						else if (row.EVENT_TYPE == "7")
							return "Start Monitoring"
						else if (row.EVENT_TYPE == "8")
							return "Stop Monitoring"
						else if (row.EVENT_TYPE == "LOG")
							return "Log Info"
								else 
							return ""
							}
					},
                    {
    				"data" : "MESSAGE"
    				}]

    				});  
   
         });  
       }
    ]);       
});