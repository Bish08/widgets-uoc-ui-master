/**
 * HPE Dataflow Configuration controllers
 * 
 * This file defines all the angular controllers used by the widget.
 * A controller corresponds to user interaction logic, and UI-model modification.
 */
define([
    'angular',                                                  // load AngularJS
    'lodash',                                                   // load lodash to be used to simply some calculations
    'addons/dataflow/widgets/hpe-dataflow-configuration/hpe-dataflow-configuration-services',    // load the widget's services
    'components/data-access/data-access-services',              // load the common service used to get data after having selected a combination of dimensions, facts and filters.
    'commons/events/commons-events',                            // load the common events of UOC platform
    'components/data-exchange/data-exchange-services',          // load the common data exchange service. It is used for the communication between widgets inside a workspace. A widget can listen to changes of exchanged data and behave consequently.
    'components/message-notifier/message-notifier-services',    // load the common notification service (used to notify errors)
    'addons/dataflow/services/dataflow-restapi'
], 
function(angular, _) { // inject angular and lodash (then lodash can be used with _.method...)
    'use strict';
    return angular.module('hpeDataflowConfigurationControllers', ['hpeDataflowConfigurationServices', 'dataAccessServices', 'commonsEvents', 'dataExchangeServices', 'messageNotifierServices', 'dataflowRestapi' ])
        .controller('hpeDataflowConfigurationController', ['$scope', '$http', '$rootScope', '$log', '$filter', '$timeout', '$q', 'messageNotifierService', 'hpeDataflowConfigurationService', 'events',  'dataAccessService',  'dataExchangeService', 'dataflowRestapiService', function($scope, $http, $rootScope, $log, $filter, $timeout, $q, messageNotifierService, hpeDataflowConfigurationService, events, dataAccessService, dataExchangeService, dataflowRestapiService) {
                var logger = $log.getInstance('hpeDataflowConfigurationController');
                if(!$scope.widget.configuration) {
                    $scope.widget.configuration = {};
                }
 //Validation pattern
 $scope.regexFormat = /^[0-9a-zA-Z_@.*&+-]+([0-9a-zA-Z_@.*&+-;]+)*$/;
 $scope.folderFormat = /^[\/][0-9a-zA-Z_@.*&+-]+([0-9a-zA-Z_@.*&+-;]+[\/])*$/;
 $scope.dependenciesFormat = /^[0-9]+([0-9]+;)*$/;
 $scope.numberOfFilesFormat = /^[0-9]+$/;
 //end validation pattern
 
$http({
    method: 'GET',
    url: dataflowRestapiService.restapi.dataflowManagement.GET_TASPS_LIST
}).success(function (result) {

 var taspsList = [];
 
for(var i in result.rows) {    

var item = result.rows[i];   

taspsList.push({ 
    id : item.uid,
    label  : item.packageDisplayString[0].displayString + " - " + item.L7dName[0].displayString
});
}

	$scope.taspsList = taspsList;
});

$http({
    method: 'GET',
    url: dataflowRestapiService.restapi.dataflowManagement.GET_VALUEPACK_LIST
}).success(function (result) {

 var valuepackList = [];
 
for(var i in result) {    

var item = result[i];   

valuepackList.push({ 
    id : item.dataflow_id,
    label  : item.dataflow_id
});
}

	$scope.valuepackList = valuepackList;
});
 
 $scope.submit = function() {
 		var id = $scope.dataflow.id;
		var description = $scope.dataflow.description;
		var frequency = $scope.dataflow.frequency;
		var value_pack = $scope.dataflow.valuepack;
		var isLast = $scope.dataflow.isLast;
		var trigger_type = $scope.dataflow.trigger_type;
		var status = 0
		var number_files = $scope.dataflow.number_of_files;
		var regex = $scope.dataflow.files_regexs;
		var folder = $scope.dataflow.folder;
 	    var tasps_id = $scope.dataflow.tasps_id;
 	   var auto_increment_date = $scope.dataflow.increment_load_date;	
 	   
var urlGet = dataflowRestapiService.restapi.dataflowManagement.GET_BY_TASPS_ID +'?tasps_id=' + tasps_id;   
$http.get(urlGet,{cache: false})
.then(function(response) {
	if (response.data.result=='401') {
        var urlCreate = dataflowRestapiService.restapi.dataflowManagement.CREATE;
			if (trigger_type == 2)
				var dataObj = {
					       		dataflow_id : $scope.dataflow.id,
					       		status : 0,
					       		description : $scope.dataflow.description,
					       		frequency : $scope.dataflow.frequency,
								value_pack : $scope.dataflow.valuepack,
								isLast : $scope.dataflow.isLast,
					       		trigger_type : $scope.dataflow.trigger_type,
					       	    tasps_id : $scope.dataflow.tasps_id,
					       	    dataflow_dependencies : $scope.dataflow.previous_dataflows.join(";"),
					       	    auto_increment_date : $scope.dataflow.increment_load_date
					       	    
					       	};	
			else if (trigger_type == 1) {
				var dataObj = {
					       		dataflow_id : $scope.dataflow.id,
					       		status : 0,
					       		description : $scope.dataflow.description,
					       		frequency : $scope.dataflow.frequency,
								value_pack : $scope.dataflow.valuepack,
								isLast : $scope.dataflow.isLast,
					       		trigger_type : $scope.dataflow.trigger_type,
					       	    tasps_id : $scope.dataflow.tasps_id,
								number_files : $scope.dataflow.number_of_files,
								regex : $scope.dataflow.files_regexs,
								folder : $scope.dataflow.folder,
								auto_increment_date : $scope.dataflow.increment_load_date
					       	};	
			
			} else {
				var dataObj = {
				       		dataflow_id : $scope.dataflow.id,
				       		status : 6,
				       		description : $scope.dataflow.description,
							value_pack : $scope.dataflow.valuepack,
							isLast : $scope.dataflow.isLast,
				       		frequency : $scope.dataflow.frequency,
				       		trigger_type : $scope.dataflow.trigger_type,
				       	    tasps_id : $scope.dataflow.tasps_id,
				       	    auto_increment_date	 : $scope.dataflow.increment_load_date

				       	};	
			}
        


			$http.post(urlCreate,dataObj)
				.then(function(response) {
					if (response.data.result!='200') {
						logger.info(response.data);
						hpeDataflowConfigurationService.generateAsynchronousError().then(function() {
                        messageNotifierService.success('Congratulation');
						}).then(null, function(err) {
                        logger.error('An error occured during rest API response', err);
                        messageNotifierService.error('An error occurred during the creation of the dataflow.');
						});
                    } else {
                    	logger.info("Done "+response.data);
                    	$('#dataflowtable').DataTable().ajax.reload();
                        messageNotifierService.success('Dataflow successfully created on db.');
                    	$scope.dataflow.id=null;
			       		$scope.dataflow.description=null;
			       		$scope.dataflow.frequency=null;
			       		$scope.dataflow.trigger_type=null;
			       		$scope.dataflow.valuepack=null;
			       		$scope.dataflow.isLast=null;
			       	    $scope.dataflow.tasps_id=null;
						$scope.dataflow.number_of_files=null;
						$scope.dataflow.files_regexs=null;
						$scope.dataflow.folder=null;
						$scope.dataflow.increment_load_date=null;
						$scope.dataflow.previous_dataflows=null;
						}
			});   
			} else {
			       messageNotifierService.error('Dataflow with this TASPS Id already exists.');
			  }
			});  
      
        }     
        }
    ]);
});