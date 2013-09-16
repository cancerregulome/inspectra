define([
	'mediator-js'
	,'menu'
], function(mediator, menu) {
	'use strict'


	function loadDatasetList() {
		mediator.publish('application:controller:LoadDatasetList');
	}

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

	function initializeDataControllers() {
		mediator.subscribe('application:menu:DatasetListPopulated', function(selectedDataset){
				mediator.publish('application:controller:LoadDataset', selectedDataset);
			});
		mediator.subscribe('application:menu:DatasetSelected', function(selectedDataset) {
				mediator.publish('application:controller:LoadDataset', selectedDataset);
			});
	}

	function initializeMenuControllers() {
		mediator.subscribe('application:data:DatasetListLoaded', function(obj) {
			mediator.publish('application:controller:PopulateDatasetListSelect', obj);
		});
		mediator.subscribe('application:data:DataUploadComplete', function(obj) {
			mediator.publish('application:controller:LoadDatasetList', obj);
		});
	}

	function initializeVisControllers() {
		mediator.subscribe('application:data:DatasetLoaded', function(graphObj){
			mediator.publish('application:controller:DrawNetwork', graphObj);
		});
		mediator.subscribe('application:menu:ClusterPanelChanged', function (filterObj) {
			mediator.publish('application:controller:ClusterNetwork', filterObj);
		});
		mediator.subscribe('application:menu:DisplayPanelChanged', function (paramObj) {
			mediator.publish('application:controller:RedrawNetwork', paramObj);
		});
	}

	function initializeControllers() {
		initializeDataControllers();
		initializeMenuControllers();
		initializeVisControllers();
	}

	var Controller = {
		initialize: function() {
			initializeControllers();
		},
		start: function() {
			loadDatasetList();
		}
	};
	return Controller;
});