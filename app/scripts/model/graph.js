define([
	  'underscore'
	, 'rbush'  //rbush installs itself on the global object
], function (_) {

var n1 = 'source',
	n2 = 'target';

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
	__.edgeMap = {};


	__.nodeToEdgesMap = _.object(_.pluck(__.nodes,'id'), _.times(__.nodes.length,makeArray));

	__.edges.forEach(function(val, index){
		__.edgeMap[val.id] = index;
		__.nodeToEdgesMap[val[n1]].push(val.id);
		__.nodeToEdgesMap[val[n2]].push(val.id);
	});

	var nodePositions = __.nodes.map(function(node) {		
		return { id : node.id, x0: node.x, y0: node.y, x1: node.x+1, y1: node.y+1 };
	});

	__.nodeTree = rbush(nodePositions.length, ['.x0','.y0','.x1','.y1']);
	__.nodeTree.load(nodePositions);
	_.extend(graphModel, {nodes: __.nodes, edges: __.edges});

	return graphModel;
		
};

});