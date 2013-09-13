/*global define */
define([
	'jquery'
	, 'underscore'

	, 'mediator-js'
	, 'menu'
	, 'data'
	, 'vis'
], function($, _, mediator, menu, data, vis) {
	'use strict';

	var insp;
	var graph;
	var lastFilterAttr = 'x';

	function setup() {
		return initializeMediator();
	}

	function initializeMediator() {
		mediator.subscribe('application', applicationEventHandler);
		mediator.subscribe('application:menu:loadData', loadDataEventHandler);
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

	function getNodeSize() {
		return insp.vis.graphProperties("minNodeSize");
	}

	function setAlpha(alpha) {
		if (alpha === undefined) alpha = $('#opacity-slider').slider("value");
		insp.vis.drawingProperties({
			edgeAlpha: alpha
		})
	}

	function getAlpha() {
		return insp.vis.drawingProperties("edgeAlpha");
	}



	var Application = {
		initialize: function(successCallback) {
			setup();
			var deferred = $.when(data.initialize)
				.then(menu.initialize)
				.done(vis.initialize);

			return deferred.promise();

		},
		start: function() {

			var state = menu.state();
			executeLoadData(state);

			setNodeSize();
			setAlpha();
			insp.draw();
		}
	};
	return Application;
});