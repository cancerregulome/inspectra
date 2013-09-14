define([
	'mediator-js'
], function(mediator) {
	'use strict'

/*

command										parameter
application:controller:LoadDatasetList   (array of datasets)
application:controller:DrawNetwork		()
application:controller:LoadData 		(network id)
*/

/*
events:
application:vis:GraphDrawComplete
application:menu:DatasetListPopulated
application:menu:LoadDataActivated
application:data:DataUploadComplete
application:data:DatasetListLoaded
application:data:DatasetLoaded


*/

	function initializeControllers() {
		initializeDataControllers();
		initializeMenuControllers();
		initializeVisControllers();
	}

	function initializeDataControllers() {

	}

	var Controller = {
		initialize : function() {
			initializeControllers();
		},
		start : function(){

		}
	};
	return Controller;
});