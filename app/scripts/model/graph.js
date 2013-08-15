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
		nodeOrder: {},
		edges: [],
		nodeTree: null,   //think about transmitting tree from server side... rbush on node.js server 
		edgeTree: null,

		clusterTree: rbush(50, ['.box.x0','.box.y0','.box.x1','.box.y1']),
		clusters: {}
	};

	var clusterColors = [
			"#88BC53", //green
			"#A366C7", //purple
			"#BB6634", // burnt orange
			"#6199AD", // blue
			"#BC537B" // rose
	],

	filteredOutColor = "#FFFFFF",
	numColors = clusterColors.length;

	var graphModel = {
		getNodesInBox: function(left, bottom, right, top) {
			if (arguments.length === 1 ) {
				return __.nodeTree.search(left);
			}
			return __.nodeTree.search([left, bottom, right, top]);
		},
		getEdgesInBox: function(left, bottom, right, top) {
			return __.edgeTree.search(left, bottom, right, top);
		},
		assignClustersAtCutoff: function(fn, min_size, order_attr, node_property) {

			min_size = min_size || 1;
			order_attr = order_attr || 'x';
			node_property = node_property || 'color';

			var j = 0;
			var total = __.nodes.length -1;
			var closeEnough;
			var cluster = [];

			cluster[0] = [];
			__.clusters[order_attr] = [];

			if (__.nodeOrder[order_attr] === undefined) __.nodeOrder[order_attr] = _.sortBy(__.nodes, order_attr);

			var node1, 
				node2 = __.nodeOrder[order_attr][0];

			for (var i = 1; i < total; i++) {
				node1 = node2;
				node2 = __.nodeOrder[order_attr][i];
				closeEnough = fn(node1,node2);
				if (!closeEnough) {
					j++;	//make a new cluster if the nodes aren't close enough.
					cluster[j] = [];
				}
				cluster[j].push(i);
			}
			var cluster_index = 0,
				cluster_num = -1,
				cluster_color;

			_.each(cluster, function(c, index) {
				cluster_num = -1;
				cluster_color = filteredOutColor;

				if (c.length >= min_size) { 
					cluster_num = cluster_index++; 
					cluster_color = clusterColors[index%numColors];
					__.clusters[order_attr].push({nodes: c, color: cluster_color});
				}
				c.forEach(function(n){ __.nodeOrder[order_attr][n].color = cluster_color; });
			});

			this.loadClusterTree();

			this.nodes =  __.nodes;

			this.edges = __.edges;

			return this;
		},

		loadClusterTree : function() {
			var clusters = _.pairs(__.clusters);
			var tClusters = [];
			var attribute, nodeClusters, color, nodes;
			clusters.forEach( function(c) {
				attribute = c[0]; nodeClusters = c[1];
				nodeClusters.forEach( function(n) {
					var xExtent = d3.extent(n.nodes, function(d) { return __.nodeOrder[attribute][d].x;});
					var yExtent = d3.extent(n.nodes, function(d) { return __.nodeOrder[attribute][d].y;});
					tClusters.push( { 
						attr: attribute, 
						color: n.color, 
						box: { 
							x0: xExtent[0], 
							y0: yExtent[0], 
							x1: xExtent[1], 
							y1: yExtent[1] 
						} 
					});
				});
			});

			__.clusterTree.clear();
			
			__.clusterTree.load(tClusters);
		},

		isClustered : function() {
			return __.clusterTree !== null;
		},

	getClustersInFrame : function(frame) {
		var x0,x1,y0,y1;
		if (frame.length === undefined) {
			var tFrame = [frame.x0, frame.y0, frame.x1, frame.y1];
			frame = tFrame;
		}
		var result = _.uniq(__.clusterTree.search(frame), false, function(a) { return a.box;});
		return result; 
	}

};

	function loadNodes(nodes) {
		__.nodeTree.clear();
		var nodePositions = nodes.map(function(node) {		
			return { id : node.id, x0: node.x, y0: node.y, x1: node.x+.1, y1: node.y+.1 };
		});

		__.nodeExtent = {
			x : d3.extent(nodes, function(n) { return n.x; }),
			y : d3.extent(nodes, function(n) { return n.y; })
		};
		
		__.nodeTree.load(nodePositions);	

	}

	var makeArray = function() { return []; };

	if (!(graph.nodes && graph.edges)) {
		console.error('graph data missing nodes or edges');
		return;
	}
	_.extend(__, graph);
	__.nodeMap = {};

	__.nodeTree = rbush(graph.nodes.length, ['.x0','.y0','.x1','.y1']);

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

	__.edges = _.compact(edges);

	loadNodes(__.nodes);

	_.extend(graphModel, {nodes: __.nodes, edges: __.edges});

	return graphModel;
		
};

});