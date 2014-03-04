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
		'1': 'rgb(255,255,0)',
		'2': 'rgb(255,0,255)'
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
		maxRatio: 128,
		zoomMultiply: 1.2
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
	}).bind('graphscaled', function(e){
		inspectra.graph.isClustered() && inspectra.drawClusters();
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

	inspectra.clusterGroup = null;
	inspectra.clusterData = [];

	inspectra.vis = sigma_obj;
	inspectra.$el = $el;
	inspectra.$sigmaEl = $sigmaEl;
	inspectra.$clusterEl = $clusterEl;


	inspectra.populate = function(graph) {
		var self = this;
		self.graph = graph;
		self.vis.emptyGraph();
		self.vis.pushGraph(graph);

		return self;
	};

	inspectra.draw = function() {
		var args = arguments;
		this.vis.draw.apply(this,args);
		return this;
	};

	inspectra.edgeColor = function(graph_id, color) {
		edgeColors[graph_id] = color;
		return this;
	};

	inspectra.drawClusters = function() {
		var self = this;

		var screenPos = this.vis.position();

		var invert = {
			x : function(p) { return self.vis.graphProperties("invertX")((p - screenPos.stageX) / screenPos.ratio); } ,
			y : function(p) { return self.vis.graphProperties("invertY")((p- screenPos.stageY) / screenPos.ratio); }
		};

		var scale = {
			x : function(p) { return self.vis.graphProperties("scaleX")(p) * screenPos.ratio + screenPos.stageX; },
			y : function(p) { return self.vis.graphProperties("scaleY")(p) * screenPos.ratio + screenPos.stageY; }
		};

		var canvasFrame = self.vis.graphProperties("frame");
		var dataFrame = [invert.x(0), invert.y(0), invert.x(this.$sigmaEl.width()) , invert.y(this.$sigmaEl.height())];

		self.clusterData = this.graph.getClustersInFrame(dataFrame);

		self.clusterGroup = rectOverlay.selectAll('rect')
		.data(self.clusterData, function(c) {
			return _.values(c.box);
		});

		self.clusterGroup.enter()
			.append('rect')
			.attr('class',function(c) { return c.attr;})
			.attr('rx','10')
			.attr('ry','10')
			.style('fill', 'none')
			.style('stroke', function(c) { return c.color; })
			.style('stroke-width','4')
			.style('stroke-opacity','0.7')
			.on('mouseover', function() {
				d3.select(this)
					.style('stroke-opacity','1.0');
			})
			.on('mouseout', function() {
				d3.select(this)
				.style('stroke-opacity','0.7');
			});

		self.clusterGroup.filter('.x')
			.style('stroke', function(c) { return c.color; })
			.attr('width', function(c) { return scale.x(c.box.x1) - scale.x(c.box.x0); } )
			.attr('height', height + 20)
			.attr('x', function(c) { return scale.x(c.box.x0); })
			.attr('y',  '-10');

		self.clusterGroup.filter('.y')
			.style('stroke', function(c) { return c.color; })
			.attr('width', width + 20)
			.attr('height', function(c) { return scale.y(c.box.y1) - scale.y(c.box.y0); })
			.attr('x', '-10')
			.attr('y', function(c) { return scale.y(c.box.y0); } )

		self.clusterGroup.exit().remove();

	};

	return inspectra;
};

});