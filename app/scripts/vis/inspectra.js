define([
	'jquery'
	, 'sigma'
], function ($, sigma) {
		'use strict';

var sigma_obj, el;
var inspectra = {
	build : function(selector) {
			$(selector).css({
				position: 'relative',
				"border-radius": '4px',
				background: '#222'			
			}).append($('<div>'));
				
			el = $(selector +' div').css({
				position: 'absolute',
				width:'100%',
				height: '100%',
				top: '0',
				left: '0'
			});

			sigma_obj = sigma.init(el.get(0)).drawingProperties({
				defaultLabelColor: '#fff',
				defaultLabelSize: 14,
				defaultLabelBGColor: '#fff',
				defaultLabelHoverColor: '#000',
				labelThreshold: 6,
				defaultEdgeType: 'line'
			}).graphProperties({
				minedgesize: 0,
				maxNodeSize: 1,
				maxEdgeSize: 3,
				minEdgeSize: 2
			}).mouseProperties({
				maxRatio: 4
			});

			sigma_obj.bind('stopdrag', function(e) {
				var rectangle  = e.content;
				var boundaries = [Math.min(rectangle[0],rectangle[2]), Math.min(rectangle[1],rectangle[3]),Math.max(rectangle[0],rectangle[2]), Math.max(rectangle[1],rectangle[3])];
				console.log(rectangle);
				console.log(graph.getNodesInBox(boundaries));
			});
			return this;
	},

	populate : function(graph) {
		self.graph = graph;
		sigma_obj.pushGraph(graph);
		return this;
	},

	draw : function() {
			sigma_obj.draw();
			return this;
	}

};

	return inspectra;
});