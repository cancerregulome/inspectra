define([
	'jquery'
], function ( $ ) {
		'use strict';

return function build(selector) {

	var inspectra = { version: '0.0.2' };

	var $el = $(selector).empty().css({
		position: 'relative',
		"border-radius": '4px',
		background: '#000',
		marginLeft: '20px',
		marginTop: '20px'
	});

	var edgeColors = {
		'1': 'rgb(0,255,0)',
		'2': 'rgb(255,0,0)'
	};

	var $sigmaEl = $('<div>').addClass('sigma')
		.css({
		position: 'absolute',
		width: '100%',
		height: '100%',
		top: '0',
		left: '0'
	}).appendTo($el);

	var sigma_obj = sigma.init($sigmaEl.get(0)).drawingProperties({
		defaultLabelColor: '#fff',
		defaultLabelSize: 14,
		defaultLabelBGColor: '#fff',
		defaultLabelHoverColor: '#000',
		labelThreshold: 4,
		defaultEdgeType: 'line',
		edgeCompositeOperation: 'lighter',
		edgeAlpha: 1.0,
		edgeColor: function(edge) {
			return edge['attr']['graph_id'] && edgeColors[edge['attr']['graph_id']] ?
				edgeColors[edge['attr']['graph_id']] : edgeColors['1'];
		}
	}).graphProperties({
		minNnodeSize: 1,
		maxNodeSize: 1,
		minEdgeSize: 0.5,
		maxEdgeSize: 4,
		sideMargin: 10
	}).mouseProperties({
		maxRatio: 128
	}).bind('stopbrush', function(e) {
		var rectangle = e.content;
		var boundaries = [
			Math.min(rectangle[0], rectangle[2]),
			Math.min(rectangle[1], rectangle[3]),
			Math.max(rectangle[0], rectangle[2]),
			Math.max(rectangle[1], rectangle[3])
		];
		console.log(inspectra.graph.getNodesInBox(boundaries));
	}).bind('downnodes', function(e, nodes) {
		console.log(e.content)
	});

	var $clusterEl = $('<div>').addClass('clusters')
	.css({
		position: 'absolute',
		width: '100%',
		height: '100%',
		top: '-20px',
		left: '-20px',
		
	}).prependTo($sigmaEl);

	var width = $clusterEl.width(),
	height = $clusterEl.height();

	var clusterSVG = d3.select($clusterEl.get(0)).append('svg')
	.attr('class', 'inspectra clusters')
	.attr('width', width+40)
	.attr('height', height+40);

	var rectOverlay = clusterSVG.append('g')
	.attr('transform','translate(20,20)');

	inspectra.vis = sigma_obj;
	inspectra.$el = $sigmaEl;


	inspectra.populate = function(graph) {
		var self = this;
		self.graph = graph;
		self.vis.emptyGraph();
		self.vis.pushGraph(graph)
		return self;
	};

	inspectra.draw = function() {
		this.vis.draw();
		return this;
	};

	inspectra.edgeColor = function(graph_id, color) {
		edgeColors[graph_id] = color;
		return this;
	};

	inspectra.drawClusters = function(cluster_attr) {

		rectOverlay.selectAll('rect.'+cluster_attr).remove();

		this.graph.getClusters(cluster_attr).forEach(this.drawClusterRectangle, this);

	};

	inspectra.drawClusterRectangle = function(cluster) {

		if (cluster.attr === 'y') this.drawClusterRectangleY(cluster);
		else if (cluster.attr === 'x') this.drawClusterRectangleX(cluster);
	}

	inspectra.drawClusterRectangleX = function(cluster) {
		var box = cluster.box;
		var scaleX = this.vis.graphProperties("scaleX");
		rectOverlay.append('rect')
			.attr('class', 'x')
			.attr('width', scaleX(box.x1) - scaleX(box.x0))
			.attr('height', height+20)
			.attr('x', scaleX(box.x0))
			.attr('y', '-10')
			.attr('rx','10')
			.attr('ry','10')
			.style('fill', 'none')
			.style('stroke', cluster.color)
			.style('stroke-width','4')
			.style('stroke-opacity','0.4')
			.on('mouseover', function() {
				d3.select(this)
					.style('stroke-opacity','0.9');
			})
			.on('mouseout', function() {
				d3.select(this)
				.style('stroke-opacity','0.4');
			});

	}

	inspectra.drawClusterRectangleY = function(cluster) {
		var box = cluster.box;
		var scaleY = this.vis.graphProperties("scaleY");
		rectOverlay.append('rect')
			.attr('class', 'y')
			.attr('width', width + 20)
			.attr('height', scaleY(box.y1) - scaleY(box.y0))
			.attr('x', '-10')
			.attr('y', scaleY(box.y0) )
			.attr('rx','10')
			.attr('ry','10')
			.style('fill', 'none')
			.style('stroke', cluster.color)
			.style('stroke-width','4')
			.style('stroke-opacity','0.4')
			.on('mouseover', function() {
				d3.select(this)
					.style('stroke-opacity','0.9');
			})
			.on('mouseout', function() {
				d3.select(this)
				.style('stroke-opacity','0.4');
			});

	}

	return inspectra;
};

});