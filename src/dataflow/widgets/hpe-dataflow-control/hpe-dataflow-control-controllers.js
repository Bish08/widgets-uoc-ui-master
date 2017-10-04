/**
 * HPE Dataflow Control controllers
 * 
 * This file defines all the angular controllers used by the widget.
 * A controller corresponds to user interaction logic, and UI-model modification.
 * 
 */
define([
    'angular',                                                  // load AngularJS
    'lodash',                                                   // load lodash to be used to simply some calculations
    'addons/dataflow/widgets/hpe-dataflow-control/hpe-dataflow-control-services',    // load the widget's services
    'components/data-access/data-access-services',              // load the common service used to get data after having selected a combination of dimensions, facts and filters.
    'commons/events/commons-events',                            // load the common events of UOC platform
    'components/data-exchange/data-exchange-services',          // load the common data exchange service. It is used for the communication between widgets inside a workspace. A widget can listen to changes of exchanged data and behave consequently.
    'components/message-notifier/message-notifier-services',     // load the common notification service (used to notify errors)
    'addons/dataflow/widgets/hpe-dataflow-control/datatables',    // load datatables
    'addons/spsdal/services/spsdal-communicator-services',
    'addons/dataflow/services/dataflow-restapi'
], 
function(angular, _) { // inject angular and lodash (then lodash can be used with _.method...)
    'use strict';
    return angular.module('hpeDataflowControlControllers', ['hpeDataflowControlServices', 'dataAccessServices', 'commonsEvents', 'dataExchangeServices', 'messageNotifierServices', 'dataflowRestapi'])
        .controller('hpeDataflowControlController', ['$scope', '$http', '$rootScope', '$log', '$filter', '$timeout', '$q', 'messageNotifierService', 'hpeDataflowControlService', 'events',  'dataAccessService',  'dataExchangeService', 'dataflowRestapiService', function($scope, $http , $rootScope, $log, $filter, $timeout, $q, messageNotifierService, hpeDataflowControlService, events, dataAccessService, dataExchangeService, dataflowRestapiService) {
        	var logger = $log.getInstance('hpeDataflowControlController');
        
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
    //label  : item.L7dName[0].displayString
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
    label  : item.dataflow_id.toString()
});
}

	$scope.valuepackList = valuepackList;
});
$scope.convertToInt = function(id){
    return parseInt(id, 10);
};


//UPDATE LOAD DATE with Tasps Id info
$scope.submitLoadDate = function() {
		var id = $scope.dataflowLoadDate.id;
        var dataflow_load_date = $scope.dataflowLoadDate.dataflow_load_date;
        var tasps_id = $scope.dataflowLoadDate.tasps_id;

        var urlCreate = dataflowRestapiService.restapi.dataflowManagement.UPDATE;
		var dataObj = {
		      		id : $scope.dataflowLoadDate.id,	       		
		      		dataflow_load_date : $scope.dataflowLoadDate.dataflow_load_date
		};	
	    $http.put(urlCreate,dataObj)
		    .then(function(response) {
		if (response.data.result!='200') {
		      logger.info(response.data);
		      messageNotifierService.error('An error occurred updating load date of the dataflow with TASPS id '+ tasps_id);
		} else {
		     logger.info("Done "+response.data);
		     $('#dataflowtable').DataTable().ajax.reload();
		     messageNotifierService.success('Dataflow Load Date successfully updated on db for TASPS id '+tasps_id);
		     $('#dialogDate').dialog("close");
		}});         
} 
    
//DELETE DATAFLOW
$scope.submitDelete = function() {
		var id = $scope.dataflowDelete.id;
        var urlCreate = dataflowRestapiService.restapi.dataflowManagement.DELETE;
		var dataObj = {
      		id : $scope.dataflowDelete.id
};	
$http.post(urlCreate,dataObj)
		    .then(function(response) {
		if (response.data.result!='200') {
		      logger.info(response.data);
		      messageNotifierService.error('An error occurred during dataflow disabled');
		} else {
		     logger.info("Done "+response.data);
		     $('#dataflowtable').DataTable().ajax.reload();
		     messageNotifierService.success('Dataflow successfully disabled on db.');
		     $('#dialogDelete').dialog("close");

		    // $( "#dialogDelete" ).hide();
		}});         
}

//RESTORE DATAFLOW with log ID with tasps ID info
$scope.submitRestore = function() {
		var tasps_id = $scope.dataflowRestore.id;
		var trigger_type = $scope.dataflowRestore.trigger_type;
        var urlCreate = dataflowRestapiService.restapi.dataflowManagement.UPDATE_STATUS_BY_TASPS_ID;
        var statusRestore = 0;
        if (trigger_type == 0)
        	statusRestore = 6;
		var dataObj = {
      		tasps_id : $scope.dataflowRestore.id,
      		status : statusRestore
      		//status_delete : 200
};	
$http.put(urlCreate,dataObj)
		    .then(function(response) {
		if (response.data.result!='200') {
		      logger.info(response.data);
		      messageNotifierService.error('An error occurred during dataflow restoring with TASPS id '+  tasps_id);
		} else {
		     logger.info("Done "+response.data);
		     $('#dataflowtable').DataTable().ajax.reload();
		     messageNotifierService.success('Dataflow with TASPS id '+ tasps_id +' successfully restored on db.');
		     $('#dialogRestore').dialog("close");

		    // $( "#dialogDelete" ).hide();
		}});         
}

//START DATAFLOW with tasps ID info
$scope.submitStart = function() {
    var button_id = this.id; // get the id of the button clicked
    var tasps_id =  $scope.dataflowStart.id 
    //TODO Check Load Date future
    
    if (tasps_id != undefined){
    console.log ("Starting dataflow " +tasps_id)   
    var urlCreate = dataflowRestapiService.restapi.dataflowManagement.UPDATE_STATUS_BY_TASPS_ID;   
    var dataObj = {
		       		status : 2,
		       		description_status : "Manually Trigger",	       		
		       	    tasps_id :  $scope.dataflowStart.id
		       	};	
    $http.put(urlCreate,dataObj)
    .then(function(response) {
    	if (response.data.result!='200') {
    		logger.info(response.data);
             //hpeDataflowConfigurationService.generateAsynchronousError().then(function() {
             //		messageNotifierService.success('Congratulation');
             //   	}).then(null, function(err) {
             //     logger.error('An error occured during rest API response', err);
                    messageNotifierService.error('An error occurred triggering the dataflow with TASPS id '+tasps_id );
             // });
         } else {
             logger.info("Done "+response.data);
             $('#dataflowtable').DataTable().ajax.reload();
             messageNotifierService.success('Dataflow with TASPS id '+ tasps_id+' successfully triggered.');
		     $('#dialogStart').dialog("close");
             
         }
    }, function errorCallback(response) {
	    logger.info("Server error "+response.status);
	    messageNotifierService.error('An error occurred triggering the dataflow with TASPS id '+tasps_id );
  });  }
  else {
	    logger.info("No Tasps Id value - cannot start");
  	    messageNotifierService.error('This dataflow has not tasps id mapped');
  }
}  
//end on click start button
   
//UPDATE DATAFLOW INFO EDIT with tasps ID info
$scope.submit = function() {
 //TODO call API parse response
	var id = $scope.dataflowEdit.id;
 	var dataflow_id = $scope.dataflowEdit.dataflow_id;
	var description = $scope.dataflowEdit.description;
	var frequency = $scope.dataflowEdit.frequency;
	var trigger_type = $scope.dataflowEdit.trigger_type;
	//var dataflow_dependencies = $scope.dataflowEdit.previous_dataflows.join(";");
	var number_files = $scope.dataflowEdit.number_of_files;
	var regex = $scope.dataflowEdit.files_regexs;
	var folder = $scope.dataflowEdit.folder;
 	var tasps_id = $scope.dataflowEdit.tasps_id;
	var auto_increment_date = $scope.dataflowEdit.increment_load_date;	
	var isLast = $scope.dataflowEdit.isLast;
	var value_pack = $scope.dataflowEdit.value_pack;	
	
    var urlCreate = dataflowRestapiService.restapi.dataflowManagement.UPDATE;
    	if (trigger_type == 2)
    		var dataObj = {
					id : $scope.dataflowEdit.id,
		       		dataflow_id : $scope.dataflowEdit.dataflow_id,
		       	//	status : 0,
		       		description : $scope.dataflowEdit.description,
		       		frequency : $scope.dataflowEdit.frequency,
		       		trigger_type : $scope.dataflowEdit.trigger_type,
		       	    tasps_id : $scope.dataflowEdit.tasps_id,
		       	    dataflow_dependencies : $scope.dataflowEdit.previous_dataflows.join(";"),
		       	    auto_increment_date : $scope.dataflowEdit.increment_load_date,
		       	    isLast : $scope.dataflowEdit.isLast,
		       	    value_pack : $scope.dataflowEdit.value_pack
		       	};	
		else if (trigger_type == 1) {
			var dataObj = {
					id : $scope.dataflowEdit.id,
					dataflow_id : $scope.dataflowEdit.dataflow_id,
				//	status : 0,
		       		description : $scope.dataflowEdit.description,
		       		frequency : $scope.dataflowEdit.frequency,
		       		trigger_type : $scope.dataflowEdit.trigger_type,
		       	    tasps_id : $scope.dataflowEdit.tasps_id,
					number_files : $scope.dataflowEdit.number_of_files,
					regex : $scope.dataflowEdit.files_regexs,
					folder : $scope.dataflowEdit.folder,
					auto_increment_date : $scope.dataflowEdit.increment_load_date,
					isLast : $scope.dataflowEdit.isLast,
		       	    value_pack : $scope.dataflowEdit.value_pack
		       	};	

		} else {
			var dataObj = {
				id : $scope.dataflowEdit.id,
				dataflow_id : $scope.dataflowEdit.dataflow_id,
	       	//	status : 6,
	       		description : $scope.dataflowEdit.description,
	       		frequency : $scope.dataflowEdit.frequency,
	       		trigger_type : $scope.dataflowEdit.trigger_type,
	       	    tasps_id : $scope.dataflowEdit.tasps_id,
	       	    auto_increment_date : $scope.dataflowEdit.increment_load_date,
				isLast : $scope.dataflowEdit.isLast,
	       	    value_pack : $scope.dataflowEdit.value_pack

	       	};	
}
    $http.put(urlCreate,dataObj)
    .then(function(response) {
    	if (response.data.result!='200') {
    		logger.info(response.data);
            messageNotifierService.error('An error occurred updating the dataflow with TASPS id '+tasps_id);
    	} else {
            logger.info("Done "+response.data);
            $('#dataflowtable').DataTable().ajax.reload();
            messageNotifierService.success('Dataflow with TASPS id '+ tasps_id+' successfully updated on db.');
		     $('#dialog').dialog("close");

        }
    	}, function errorCallback(response) {
    		logger.info("Server error "+response.status);
    		messageNotifierService.error('A server error occurred updating the dataflow with TASPS id '+tasps_id);
  });           
} 

// jQuery - Reload Data, Load Data, Update Load Date, Update Dataflow
$(document).ready(function () {
	var taspsList = [];

 $.ajax({
            url: dataflowRestapiService.restapi.dataflowManagement.GET_TASPS_LIST,
            type: 'GET',

            async: false,
            success: function(response) {


for(var i in response.rows) {    

var item = response.rows[i];   

taspsList.push({ 
   id : item.uid,
   //label  : item.L7dName[0].displayString
   label  : item.packageDisplayString[0].displayString + " - " + item.L7dName[0].displayString

});
}

}
        });
 

	document.getElementById('reload').addEventListener('click', function() {
	console.log("Reload Data table")
	$('#dataflowtable').DataTable().ajax.reload();
	}, false);

  var urlCreate = dataflowRestapiService.restapi.dataflowManagement.GET_ALL;
  console.log("Load dataflows")
   $('#dataflowtable').DataTable(
	   
				{
				"ajax" : {
					"url" : urlCreate,
					"dataSrc" : ""
						
						},
						  "pageLength": 25,
						"order": [[ 6, "desc" ]],
					"columns" : [
						{
						"data" : "dataflow_id"
						},
                          {
                        	  
                        "render" : function(
							data, type, row) {
						if (row.tasps_id != null){
							for (var i=0;i<taspsList.length;i++){
								if (row.tasps_id == taspsList[i].id)
									return taspsList[i].label;
							}
							return row.tasps_id;
						}else 
							return "";
						}
					},
		{
			"render" : function(
					data, type, row) {
				if (row.status == 5)
					return "Disabled";
				else if (row.status == 4)
					return "Error";
				else if (row.status == 3)
					return 'Completed';
				else if (row.status == 2)
					return 'In progress';
               	else if (row.status == 1)
					return 'Today';
                else if (row.status == 0)
					return 'Tomorrow';
                else if (row.status==7)
                	return 'H_Completed'
				else
					return 'Scheduled';
		}
		},{
			"render" : function(
					data, type, row) {
				if (row.trigger_type == 0)
					return 'None';
				else if (row.trigger_type == 1)
					return 'File Availability';
				else
					return 'Dataflow Dependencies';
			}
		},{
			"render" : function(
					data, type, row) {
				if (row.is_last == 0)
					return 'No';
				else  if (row.is_last == 1)
					return 'Yes';
					else 
						return "Unknown";
			}
		},

		{
			"data" : "last_run_date",
			"defaultContent" : "N/A"

		},
		{
			"data" : "dataflow_load_date",
			"defaultContent" : "N/A"
		},
		{
			"render" : function(
					data, type, row) {
						var q = new Date();
						var m = q.getMonth();
						var d = q.getDate();
						var y = q.getFullYear();
						var today = new Date(y,m,d);
						var dataLoad=new Date(row.dataflow_load_date);
						//without gmtoffset
						var m1 = dataLoad.getMonth();
						var d1 = dataLoad.getDate();
						var y1 = dataLoad.getFullYear();
						var dataLoad1 = new Date(y1,m1,d1);

						var buttonStart='<input type="image" class="custom-area startButton" src="/addons/dataflow/widgets/hpe-dataflow-control/img/start.png" style="width:30px;height:30px;" id="start_'+row.tasps_id+'" >';
						var buttonEdit= '<input type="image" class="custom-area editButton" src="/addons/dataflow/widgets/hpe-dataflow-control/img/edit.png" style="width:30px;height:30px;" id="edit_'+row.id+'" value="Edit Dataflow">';
						var buttonEditLoadDate= '<input type="image" class="custom-area changeDateButton" src="/addons/dataflow/widgets/hpe-dataflow-control/img/editDate.png" style="width:30px;height:30px;" id="change_'+row.id+'" value="Change Load Date">';
						var buttonDelete='<input type="image" class="custom-area deleteButton" src="/addons/dataflow/widgets/hpe-dataflow-control/img/delete.png" style="width:30px;height:30px;" id="delete_'+row.id+'" value="Delete Dataflow">';
						var buttonStartDisable=' <input type="image" class="custom-area nostartButton" src="/addons/dataflow/widgets/hpe-dataflow-control/img/start-no.png" style="width:30px;height:30px;" id="nostart_'+row.tasps_id+'" >';
						var buttonEditDisable= '<input type="image" class="custom-area noeditButton" src="/addons/dataflow/widgets/hpe-dataflow-control/img/noedit.png" style="width:30px;height:30px;" id="noedit_'+row.tasps_id+'" value="Edit Dataflow">';
						var buttonEditLoadDateDisable= '<input type="image" class="custom-area nochangeDateButton" src="/addons/dataflow/widgets/hpe-dataflow-control/img/noeditDate.png" style="width:30px;height:30px;" id="nochange_'+row.tasps_id+'" value="Change Load Date">';
						var buttonDeleteDisable='<input type="image" class="custom-area nodeleteButton" src="/addons/dataflow/widgets/hpe-dataflow-control/img/nodelete.png" style="width:30px;height:30px;" id="nodelete_'+row.id+'" value="Delete Dataflow">';
						
						var buttonRestore='<input type="image" class="custom-area restoreButton" src="/addons/dataflow/widgets/hpe-dataflow-control/img/restore.png" style="width:30px;height:30px;" id="restore_'+row.tasps_id+'" value="Restore Dataflow">';
						var space='&nbsp; &nbsp; ';
						//create variable for each button and concat on return (also for restore icon)
						//if in progress everything is disabled?
						var action='';
						if (row.status == 2 || dataLoad1>today || row.status == 5)
							action = action + space + buttonStartDisable
						else 
							action = action + space + buttonStart;
						
							if (row.status == 2)
							action = action + space + buttonEditDisable + space+  buttonEditLoadDateDisable
						else 
							action = action + space + buttonEdit + space+  buttonEditLoadDate

						if (row.status == 5)
							action = action + space + buttonRestore
						else if (row.status == 2)
							action = action + space + buttonDeleteDisable
						else 
							action = action + space + buttonDelete;
							return action;
									
		} }]

	});  
               

$('#alertMonitor').on( 'click', '.closebtn', function () {
document.getElementById("alertMonitor").style.display="none"
});  

function alertMonitor()
{
    $(function() {
    	
 urlCreate = dataflowRestapiService.restapi.dataflowManagement.GET_MONITOR_STATUS; 
 var dataObj = {
		      		module : "MonitorModule"
		};	
     $http.post(urlCreate,dataObj)
    .then(function(response) {
    		if (response.data.result=='401' || response.status == 500) {
    				logger.info(response.data);
    				$( "#alertMonitor" ).show();
                	$( "#alertMonitor2" ).show();

                  //  messageNotifierService.error('An error occurred retrieving Monitor Status');
            } else {
                    //update show correct fields
            if (response.data.isAlive == true){
            	document.getElementById("alertMonitor").style.display="none";
            	document.getElementById("alertMonitor2").style.display="none";

            }	else if (response.data.isAlive == false){
            	$( "#alertMonitor" ).show();
            	document.getElementById("alertMonitor2").style.display="none";
            }  else {
            	$( "#alertMonitor" ).show();
            	$( "#alertMonitor2" ).show();
            }
            }
    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
                   	$( "#alertMonitor" ).show();
            	$( "#alertMonitor2" ).show();
      });                  

    });
}

setInterval( alertMonitor, 20000 );


//on click edit button enable popup dialog and populate fields
 $('#dataflowtable tbody').on( 'click', '.editButton', function () {
	 $( "#dialog" ).dialog({width: "40%", minWidth: "500px"});
     $( "#dialog" ).show();
     var button_id = this.id; // get the id of the button clicked
     var id = button_id.replace("edit_", "") 
     urlCreate = dataflowRestapiService.restapi.dataflowManagement.GET_BY_ID +'?id=' + id;   
     $http.get(urlCreate,{cache: false})
    .then(function(response) {
    		if (response.data.result=='401' || response.status == 500) {
    				logger.info(response.data);
                    messageNotifierService.error('An error occurred during the dataflow retrieving for update.');
            } else {
                    logger.info("Info about dataflow successfully loaded "+response.data);             
                    //update show correct fields
                    $scope.dataflowEdit.id=response.data.id;
                    $scope.dataflowEdit.dataflow_id=response.data.dataflow_id;
                    $scope.dataflowEdit.tasps_id=response.data.tasps_id!= undefined? parseInt(response.data.tasps_id): "";
                    $scope.dataflowEdit.description=response.data.description;
                    $scope.dataflowEdit.frequency=response.data.frequency.toString();
                    $scope.dataflowEdit.trigger_type = response.data.trigger_type.toString();
                    $scope.dataflowEdit.files_regexs=response.data.regex!= undefined? response.data.regex : "";
                    $scope.dataflowEdit.number_of_files=response.data.number_files!= undefined? response.data.number_files: "" ;                
                    $scope.dataflowEdit.folder=response.data.folder != undefined ? response.data.folder : "";
                    $scope.dataflowEdit.increment_load_date=response.data.auto_increment_date.toString();     
                    $scope.dataflowEdit.isLast=response.data.is_last!=undefined ? response.data.is_last.toString() :"";
                    $scope.dataflowEdit.value_pack=response.data.value_pack!=undefined ? String(response.data.value_pack):"";     
                  
                    var arrayDep =response.data.dataflow_dependencies!=undefined ? response.data.dataflow_dependencies.split(";"): "";
                    $scope.dataflowEdit.previous_dataflows=[];
                    for (var i=0;i<arrayDep.length;i++){
                    	$scope.dataflowEdit.previous_dataflows.push(parseInt(arrayDep[i]))
                    	}
                
                 

//$scope.dataflowEdit.previous_dataflows=response.data.dataflow_dependencies != undefined ? parseInt(2250004) : ""; 
            }
    });                  
}); 
// end on click edit button

//on click delete button enable popup dialog to confirm
 $('#dataflowtable tbody').on( 'click', '.deleteButton', function () {
	 $( "#dialogDelete" ).dialog({width: "40%", minWidth: "500px"});
     $( "#dialogDelete" ).show();
     var button_id = this.id; // get the id of the button clicked
     var id_dataflow = button_id.replace("delete_", "") 
     $scope.dataflowDelete.id=id_dataflow;                      
}); 
// end on click delete button

//on click restore button enable popup dialog to confirm
 $('#dataflowtable tbody').on( 'click', '.restoreButton', function () {
	 $( "#dialogRestore" ).dialog({width: "40%", minWidth: "500px"});
     $( "#dialogRestore" ).show();
     var button_id = this.id; // get the id of the button clicked
     var id_dataflow = button_id.replace("restore_", "") 
     var urlCreate = urlCreate = dataflowRestapiService.restapi.dataflowManagement.GET_BY_TASPS_ID +'?tasps_id=' + id_dataflow;   
     $http.get(urlCreate,{cache: false})
    .then(function(response) {
    	if (response.data.result=='401'  || response.status == 500) {
    		logger.info(response.data);
            messageNotifierService.error('An error occurred during the dataflow retrieving for restoring.');
        } else {
                        logger.info("Info about dataflow load date successfully loaded "+response.data);
                        $scope.dataflowRestore.trigger_type=response.data.trigger_type;
                        $scope.dataflowRestore.id=id_dataflow;       
       }
    });  
}); 
// end on click delete button

//on click start button enable popup dialog to confirm
 $('#dataflowtable tbody').on( 'click', '.startButton', function () {
	 $( "#dialogStart" ).dialog({width: "40%", minWidth: "500px"});
     $( "#dialogStart" ).show();
     var button_id = this.id; // get the id of the button clicked
     var id_dataflow = button_id.replace("start_", "") ;
     $scope.dataflowStart.id=id_dataflow;                      
}); 
// end on click start button

//on click no-start load date
$('#dataflowtable tbody').on( 'click', '.nostartButton', function () {
			logger.info("Cannot Start");
			 var button_id = this.id; // get the id of the button clicked
		     var id = button_id.replace("nostart_", "") ;
		     messageNotifierService.error('Cannot start. Dataflow with TASPS id '+id+' currently in progress.');
  
    });  
//end on click edit load date
    
//on click nodeleteButton load date
$('#dataflowtable tbody').on( 'click', '.nodeleteButton', function () {
			logger.info("Cannot Delete");
			 var button_id = this.id; // get the id of the button clicked
		     var id = button_id.replace("nodelete_", "") ;
		     messageNotifierService.error('Cannot delete. Dataflow with TASPS id '+id+' currently in progress.');
    });  
//end on click nodeleteButton

//on clicknochangeDateButton
$('#dataflowtable tbody').on( 'click', '.nochangeDateButton', function () {
			logger.info("Cannot Edit Load Date");
			  var button_id = this.id; // get the id of the button clicked
			  var id = button_id.replace("nochange_", "") ;
			  messageNotifierService.error('Cannot change load date. Dataflow with TASPS id '+id+' currently in progress.');  
    });  
//end on click nochangeDateButton

//on click noeditButton
$('#dataflowtable tbody').on( 'click', '.noeditButton', function () {
			logger.info("Cannot Edit");
			  var button_id = this.id; // get the id of the button clicked
			     var id = button_id.replace("noedit_", "") ;
			 messageNotifierService.error('Cannot edit dataflow. Dataflow with TASPS id '+id+' currently in progress.');
     });  
//end noeditButton
    
//on click edit load date
$('#dataflowtable tbody').on( 'click', '.changeDateButton', function () {
     $( "#dialogDate" ).dialog({width: "40%", minWidth: "500px"});
     $( "#dialogDate" ).show();
     var button_id = this.id; // get the id of the button clicked
     var id = button_id.replace("change_", "") 
     var urlCreate = urlCreate = dataflowRestapiService.restapi.dataflowManagement.GET_BY_ID +'?id=' + id;   
     $http.get(urlCreate,{cache: false})
    .then(function(response) {
    	if (response.data.result=='401'  || response.status == 500) {
    		logger.info(response.data);
            messageNotifierService.error('An error occurred retrieveng info for update dataflow with id ' +id);
        } else {
                        logger.info("Info about dataflow load date successfully loaded "+response.data);
                        $scope.dataflowLoadDate.dataflow_load_date=response.data.dataflow_load_date;
                        $scope.dataflowLoadDate.id=response.data.id;
                        $scope.dataflowLoadDate.tasps_id=response.data.tasps_id;
       }
    });  
}); 
//end on click edit load date


         });  
       }
    ]);       
});