define([
	'vis/inspectra'
	, 'model/graph'
	,'mediator-js'
], function ( inspectra, graphModel, mediator ) {
'use strict'

	var defaults = {
		drawRules: {
			auto: false,
			drawNodes: 2,
			drawEdges: 1,
			drawLabels: 2
		},

		graphContainer: '#main_graph'
	};

	var graph;
	var insp;

	var __ = {};

function subscribeListeners() {
	mediator.subscribe('application:controller:draw')
}

function filterClusters(filterObj) {
		var attr = filterObj.filterAxis || __.lastFilterAttr;
		__.lastFilterAttr = attr;
		var cutoff = $('#' + attr + '-delta-f1-cutoff-slider').slider("value"),
			graph = attr === 'x' ? 'graph1' : 'graph2',
			minSize = $('#' + attr + '-min-cluster-size-slider').slider("value");
		graph.assignClustersAtCutoff(function(node1, node2) {
			var delta = Math.abs(node2[graph].f1 - node1[graph].f1);
			return (delta <= cutoff);
		}, minSize, attr);
		insp.populate(insp.graph);
		insp.drawClusters();
	}


	function renderOnlyNodes() {
		insp.vis.configProperties({
			drawEdges: -1
		});
		insp.draw();
		insp.vis.configProperties(__.drawRules);
	}

	function drawInspectra(data) {
				graph = graphModel(data);
				if (insp === undefined) insp = inspectra(graphContainer);
				insp.vis.configProperties(__.drawRules);
				insp.populate(graph);
				mediator.publish('application:vis:GraphDrawComplete');
			};

function initializeVis(deferred) {
	deferred.resolve();
}

	var Vis = {
		initialize: function(config) {
			_.extend(__, defaults, config);
			var deferred = $.Deferred();
			subscribeListeners();
			initializeVis(deferred);
			return deferred.promise();
		},
		plot : function(div) {

		},
		empty : function() {
			return this;
		},
		addData : function(data) {
			circle_vis.addNodes(data);
			return this;
		}

	};
	return Vis;
});