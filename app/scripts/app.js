/*global define */
define([
	'jquery'
	, 'underscore'
	, 'mediator'
	, 'controller'
	, 'menu'
	, 'data'
	, 'vis'
	, 'enrich'
	, 'table'
], function($, _, mediator, controller, menu, data, vis, ponzi, table) {
	'use strict';

	var insp;
	var graph;
	var lastFilterAttr = 'x';

	function setup() {
		return initializeMediator();
	}

	function initializeMediator() {
		mediator.subscribe('application', applicationEventHandler);
	}

	function applicationEventHandler() {

	}


	function loadDataEventHandler(menuState) {
		executeLoadData(menuState);
	}

	function executeLoadData(state) {
		var promise = data.request(state);
		promise.done(function(responseObject) {
			if (responseObject.status === 'success') {
				vis.empty().addData(responseObject.results);
			}
		});
	}

	function setNodeSize(nodeSize) {
		if (nodeSize === undefined) nodeSize = $('#node-size-slider').slider("value");
		insp.vis.graphProperties({
			minNodeSize: nodeSize,
			maxNodeSize: nodeSize
		});
	}

	var Application = {
		initialize: function() {
			setup();
			var deferred = $.when(controller.initialize())
				.then(ponzi.initialize())
				.then(data.initialize())
				.then(menu.initialize())
				.then(table.initialize())
				.done(vis.initialize());

			return deferred.promise();

		},
		start: function() {
			controller.start();
		}
	};
	return Application;
});
