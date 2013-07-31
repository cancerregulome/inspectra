/*global define */
define([
	 'jquery'
	,'underscore'
	,'model/graph'
	,'vis/inspectra'
], function ($, _, graphModel, inspectra) {
    'use strict';

	var vis;

	var Application = {
		initialize : function() {
			var graphInput = {
						nodes: [ 
						{ id:'0', x: 10, y:10},
						{ id:'1', x: 12, y:20},
						{ id:'2', x: 11, y:15},
						{ id:'3', x: 35, y:12},
						{ id:'4', x: 37, y:18}
						],
						edges: [
						{ id: '0-1', source: '0', target : '1', color: '#00FF00'},
						{ id: '2-1', source: '2', target : '1', color: '#00FF00'},
						{ id: '3-4', source: '3', target : '4', color: '#FF0000'},
						{ id: '1-4', source: '1', target : '4', color: '#FF0000'},
						{ id: '0-3', source: '0', target : '3', color: '#FF0000'}
						]
			};
			var graph = graphModel(graphInput);

			vis = inspectra.build('#main_graph').populate(graph);
		},
		start : function() {
			vis.draw();
		}
	};
	return Application;
});