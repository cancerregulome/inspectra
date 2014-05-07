define([
	'vis/inspectra'
	, 'model/graph'
	,'mediator'
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
			drawEdges: 1,
		},
		graphProperties : {
			nodeSize : 0.5,
		},
		clusterProperties: {
			x: {}, y: {}
		},
		gap_fn : function(attr, cutoff) {
			return function(node1, node2) {
					return Math.abs(node2[attr].f1 - node1[attr].f1) < cutoff;
					};
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
	_.extend(__.clusterProperties, filterObj.clusterProperties);

	['x','y'].forEach( function(attr) {
		var cutoff = __.clusterProperties[attr].delta,
			graph = attr === 'x' ? 'graph1' : 'graph2',
			minSize = __.clusterProperties[attr].minSize;
			insp.graph.assignClustersAtCutoff(__.gap_fn(graph, cutoff), minSize, attr);
	});
		insp.populate(insp.graph);
		insp.drawClusters();
		renderOnlyNodes();
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
				insp.onClusterSelect(function(nodes) {
					var ids = _.pluck(nodes, 'id');
					var genes = ids.map( function(id) { return id.split(':')[2]; });
					mediator.publish('application:vis:GeneListSelected', genes);
				});

				insp.populate(graph);
				draw();
			};

function applyDrawParameters(paramObj) {

	__.drawProperties = paramObj;
	__.drawRules.drawEdges = paramObj.drawRules.drawEdges;
	insp.vis.graphProperties({
		minNodeSize: paramObj.graphProperties.nodeSize,
		maxNodeSize: paramObj.graphProperties.nodeSize
	});
	insp.edgeColor('1', paramObj.drawingProperties.graph1Color);
	insp.edgeColor('2', paramObj.drawingProperties.graph2Color);
	insp.vis.configProperties(__.drawRules);
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
