define([
	'jquery'
], function ( $ ) {
		'use strict';

return function build(selector) {
	var inspectra = { version: '0.0.1' };
			$(selector).empty().css({
				position: 'relative',
				"border-radius": '4px',
				background: '#000'			
			}).append($('<div>'));

			var edgeColors = {
				'1' : 'rgb(0,255,0)',
				'2' : 'rgb(255,0,0)'
			};
				
			var el = $(selector +' div').css({
				position: 'absolute',
				width:'100%',
				height: '100%',
				top: '0',
				left: '0'
			});

			var sigma_obj = sigma.init(el.get(0)).drawingProperties({
				defaultLabelColor: '#fff',
				defaultLabelSize: 14,
				defaultLabelBGColor: '#fff',
				defaultLabelHoverColor: '#000',
				labelThreshold: 4,
				defaultEdgeType: 'line',
				edgeCompositeOperation: 'lighter',
				edgeAlpha: 1.0,
				edgeColor: function(edge) { return  edge['attr']['graph_id'] && edgeColors[edge['attr']['graph_id']] ? 
							edgeColors[edge['attr']['graph_id']] : edgeColors['1']; 
				}
			}).graphProperties({
				minNnodeSize: 1,
				maxNodeSize: 1,
				minEdgeSize: 0.5,
				maxEdgeSize: 4,
				sideMargin: 10
			}).mouseProperties({
				maxRatio: 16
			}).bind('stopbrush', function(e) {
			var rectangle  = e.content;
			var boundaries = [
			Math.min(rectangle[0],rectangle[2]), 
			Math.min(rectangle[1],rectangle[3]),
			Math.max(rectangle[0],rectangle[2]), 
			Math.max(rectangle[1],rectangle[3])
			];

			console.log(self.graph.getNodesInBox(boundaries));
		});

			sigma_obj
			inspectra.vis = sigma_obj;
			inspectra.el = el;

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

	}

	return inspectra;
};

});