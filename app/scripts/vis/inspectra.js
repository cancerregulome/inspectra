define([
	'jquery'
	, 'vivagraph'
], function ($, Viva) {
		'use strict';

var inspectra = {
	drawGraph : function(selector) {
		var graph= Viva.Graph.graph();
		graph.addLink(1,2);

		var layout = Viva.Graph.Layout.forceDirected(graph, {
           springLength : 30,
           springCoeff : 0.0008,
           dragCoeff : 0.02,
           gravity : -1.2
        });

        var graphics = Viva.Graph.View.svgGraphics();

		var renderer = Viva.Graph.View.renderer( graph, {
		 	layout: layout,
		 	graphics: graphics,
		 	container: $(selector).get(0)
		});
        renderer.run();
	}

		};

		return inspectra;
});