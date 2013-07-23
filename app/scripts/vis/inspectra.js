define([
	'jquery'
	, 'sigma'
], function ($, sigma) {
		'use strict';

var inspectra = {
	drawGraph : function(selector) {
		var graph= sigma.init($(selector).get(0));
		graph.addNode('1', {
			label: '1',
			color:'#ff0000'
		}).addNode('2', {
			label:'2',
			color:'#00ff00'
		}).addEdge('1 and 2', '1', '2')
		.draw();
	}

		};

		return inspectra;
});