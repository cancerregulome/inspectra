define([
	'jquery'
	, 'sigma'
], function ($, sigma) {
		'use strict';

return function build(selector) {
	var inspectra = { version: '0.0.1' };
			$(selector).css({
				position: 'relative',
				"border-radius": '4px',
				background: '#000'			
			}).append($('<div>'));
				
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
				labelThreshold: 6,
				defaultEdgeType: 'line',
				edgeCompositeOperation: 'lighter',
				edgeAlpha: 1.0
			}).graphProperties({
				minedgesize: 0,
				maxNodeSize: 1,
				maxEdgeSize: 3,
				minEdgeSize: 2
			}).mouseProperties({
				maxRatio: 4
			});

			sigma_obj
			inspectra.vis = sigma_obj;
			inspectra.el = el;

	inspectra.populate = function(graph) {
		var self = this;
		self.graph = graph;
		self.vis.pushGraph(graph)
		.bind('stopdrag', function(e) {
			var rectangle  = e.content;
			var boundaries = [Math.min(rectangle[0],rectangle[2]), Math.min(rectangle[1],rectangle[3]),Math.max(rectangle[0],rectangle[2]), Math.max(rectangle[1],rectangle[3])];
			console.log(rectangle);
			console.log(self.graph.getNodesInBox(boundaries));
		});

		return self;
	};

	inspectra.draw = function() {
			this.vis.draw();
			return this;
	};

	return inspectra;
};

});