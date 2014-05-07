define([
	'mediator'
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
		// mediator.subscribe('application:vis:GraphDrawComplete', function(obj) {
		// 	mediator.publish('application:controller:PushFilterEvent');
		// });
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

	function initializeModuleControllers() {
		mediator.subscribe('application:vis:GeneListSelected', function(geneList) {
			mediator.publish('application:controller:EnrichGeneList', geneList);
		});
		mediator.subscribe('application:modules:enrich:EnrichmentResults', function(enrichmentObj) {
			mediator.publish('application:controller:UpdateEnrichmentTable', enrichmentObj);
		});
	}

	function initializeControllers() {
		initializeDataControllers();
		initializeMenuControllers();
		initializeVisControllers();
		initializeModuleControllers();
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
