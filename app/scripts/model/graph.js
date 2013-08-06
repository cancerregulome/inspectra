define([
	  'underscore'
	, 'rbush'  //rbush installs itself on the global object
], function (_) {
'use strict'

var n1 = 0,
	n2 = 1,
	weight = 2,
	id = 'id',
	source = 'source',
	target = 'target';

return function(graph) {

	var __ = {
		nodes: [],
		nodeMap: {},
		edges: [],
		nodeTree: null,   //think about transmitting tree from server side... rbush on node.js server 
		edgeTree: null
	};

	var graphModel = {
		getNodesInBox: function(left, bottom, right, top) {
			if (arguments.length === 1 ) {
				return __.nodeTree.search(left);
			}
			return __.nodeTree.search([left, bottom, right, top]);
		},
		getEdgesInBox: function(left, bottom, right, top) {
			return __.edgeTree.search(left, bottom, right, top);
		}

	};

	var makeArray = function() { return []; };

	if (!(graph.nodes && graph.edges)) {
		console.error('graph data missing nodes or edges');
		return;
	}
	_.extend(__, graph);
	__.nodeMap = {};
	__.nodes.forEach(function(val, index){
		__.nodeMap[val.id] = index;
	});
	
	__.nodeToEdgesMap = _.object(_.pluck(__.nodes,id), _.times(__.nodes.length,makeArray));
	var id1, id2, edge_id;
	var edges = __.edges.map(function(edge) {
		id1 = __.nodes[edge[0]][id];
		id2 = __.nodes[edge[1]][id];
		edge_id = '' + id1 + '-' + id2;
		if (_.contains(__.nodeToEdgesMap[id1], edge_id) || _.contains(__.nodeToEdgesMap[id2], edge_id)) {
			edge_id = edge_id + ' ' + Math.random();
		}
		__.nodeToEdgesMap[id1].push(edge_id);
		__.nodeToEdgesMap[id2].push(edge_id);
		return { id: edge_id, source: id1, target: id2, weight: edge[2], graph_id: ''+edge[3] };
	});

	edges = _.compact(edges);

	var nodePositions = __.nodes.map(function(node) {		
		return { id : node.id, x0: node.x, y0: node.y, x1: node.x+.1, y1: node.y+.1 };
	});

	__.nodeTree = rbush(nodePositions.length, ['.x0','.y0','.x1','.y1']);
	__.nodeTree.load(nodePositions);
	_.extend(graphModel, {nodes: __.nodes, edges: edges});

	return graphModel;
		
};

});