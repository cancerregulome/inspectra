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
		edgeColors: {
			'1': 'rgb(0,255,0)',
			'2': 'rgb(255,0,0)'
		},
		drawingProperties:{
			edgeCompositeOperation: 'lighten',
			edgeAlpha: 0.05,
			drawEdges: true,
		},
		graphProperties : {
			nodeSize : 0.5,
		},
		gap_fn : function(node1, node2) {
			return Math.abs(node2[graph].f1 - node1[graph].f1);
		},
		graphContainer: '#main_graph'
	};

	var graph;
	var insp;

	var __ = {};

function subscribeListeners() {
	mediator.subscribe('application:controller:DrawNetwork', drawInspectra);
	mediator.subscribe('application:controller:ClusterNetwork', filterClusters);
	mediator.subscribe('application:controller:RedrawNetwork', applyDrawParameters);
}

function populateVis() {

}

function filterClusters(filterObj) {
		
	['x','y'].forEach( function(attr) {
		var cutoff = __.clusterProperties[attr].delta,
			graph = attr === 'x' ? 'graph1' : 'graph2',
			minSize = filterObj.graphProperties[attr].minSize;
			graphModel.assignClustersAtCutoff(__.gap_fn, minSize, attr);
	});
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

function draw() {
		insp.draw();
		mediator.publish('application:vis:GraphDrawComplete');
}

function drawInspectra(data) {
				graph = graphModel(data);
				if (insp === undefined) insp = inspectra(__.graphContainer);
				insp.vis.configProperties(__.drawRules);
				insp.vis.drawingProperties(__.drawingProperties);
				insp.populate(graph);
				draw();
			};

function applyDrawParameters(paramObj) {
	insp.vis.configProperties(paramObj.drawingProperties);
	insp.vis.drawingProperties(paramObj.drawingProperties);
	draw();
}

function initializeVis() {
	
}

	var Vis = {
		initialize: function(config) {
			_.extend(__, defaults, config);
			subscribeListeners();
			initializeVis();
		},
		plot : function(div) {
			return this;
		},
		empty : function() {
			return this;
		},
		populate : function(data) {
			populateVis(data);
			return this;
		}

	};
	return Vis;
});