/*global define */
define([
	 'jquery'
	,'underscore'
	,'model/graph'
	,'vis/inspectra'
], function ($, _, graphModel, inspectra) {
    'use strict';

	var Application = {
		initialize : function() {
			var graph = {
						nodes: [ 
						{ id:'0', x: 10, y:10},
						{ id:'1', x: 20, y:20},
						{ id:'2', x: 30, y:30},
						{ id:'3', x: 40, y:40},
						{ id:'4', x: 50, y:50}
						],
						edges: [
						{ id: '0-1', n1: '0',n2 : '1'},
						{ id: '2-1', n1: '2',n2 : '1'},
						{ id: '3-4', n1: '3',n2 : '4'},
						{ id: '1-4', n1: '1',n2 : '4'},
						{ id: '0-3', n1: '0',n2 : '3'}
						]
			};
			graphModel.buildGraph(graph);

			// inspectra.drawGraph('#main_graph');
		},
		start : function() {
		}
	};
	return Application;
});