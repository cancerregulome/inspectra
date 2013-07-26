define([
	'jquery'
	, 'sigma'
], function ($, sigma) {
		'use strict';

var inspectra = {
	drawGraph : function(selector) {
		$(selector).css({
			position: 'relative',
			"border-radius": '4px',
			background: '#222'			
		}).append($('<div>'));
			
		var el = $(selector +' div').css({
			position: 'absolute',
			width:'100%',
			height: '100%',
			top: '0',
			left: '0'
		});
			var graph = sigma.init(el.get(0)).drawingProperties({
				defaultLabelColor: '#fff',
				defaultLabelSize: 14,
				defaultLabelBGColor: '#fff',
				defaultLabelHoverColor: '#000',
				labelThreshold: 6,
				defaultEdgeType: 'curve'
			}).graphProperties({
				minNodeSize: 0,
				maxNodeSize: 1,
				maxEdgeSize: 3,
				minEdgeSize: 2
			}).mouseProperties({
				maxRatio: 4
			});

			graph.addNode('hello', {
				label: 'Hello',
				x: Math.random(),
				y: Math.random(),
				color: '#ff0000',
				size : 1
			}).addNode('world', {
				label: 'World!',
				x: Math.random(),
				y: Math.random(),
				color: '#ff4400',
				size : 1
			}).addEdge('hello_world', 'hello', 'world', {size : 8})
			.draw();

}

};

		return inspectra;
});