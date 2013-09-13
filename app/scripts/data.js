define([
	'mediator-js'
], function(mediator) {
	'use strict'

function loadData(val) {
	$.getJSON('view?id=' + val, {
			format: "json"
		}).done( function(responseObj) {
		mediator.publish('application:data:DatasetLoaded', responseObj) 
	});
}

function loadDatasetList() {
	return $.getJSON('view', { format: "json" })
	.done(function(responseObj) {
		if (responseObj.graphs) {
			mediator.publish('application:data:DatasetListLoaded', responseObj.graphs);
		}
	});
}

function subscribeListeners() {
	mediator.subscribe('application:data:DataUploadComplete', loadDatasetList);
}

	function loadJson(file, successCallback, failCallback, alwaysCallback) {
		
	}


	var Data = {
		initialize : function( ) {
			subscribeListeners();
			loadDatasetlist();
		},
		request : function(val) {
			return loadData(val);
		}
	};
	return Data;
});