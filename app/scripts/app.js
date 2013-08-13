/*global define */
define([
	 'jquery'
	,'underscore'
	,'model/graph'
	,'vis/inspectra'
], function ($, _, graphModel, inspectra) {
    'use strict';

	var insp;
	var loadSuccess = false;
	var graph;
	var lastFilterAttr = 'x';
	var debounceInterval = 500;

	function filterClusters(attr) {
		attr = attr || lastFilterAttr;
		lastFilterAttr = attr;
		var cutoff = $('#' + attr + '-delta-f1-cutoff-slider').slider("value"),
			graph = attr === 'x' ? 'graph1' : 'graph2',
		 	minSize = $('#' + attr + '-min-cluster-size-slider').slider("value");
		insp.graph.assignClustersAtCutoff( function(node1, node2) { 
			var delta = Math.abs(node2[graph].f1 - node1[graph].f1);
			return (delta <= cutoff); } 
			, minSize, attr);
		insp.populate(insp.graph);
	}

	function resizeNodes() {
		var val = $('#node-size-slider').slider("value");
		insp.vis.graphProperties({minNodeSize: val, maxNodeSize: val});
	}

	function changeAlpha() {
		var val = $('#opacity-slider').slider("value");
		insp.vis.drawingProperties({edgeAlpha: val})
	}

	function loadJson(file, callback) {
		$.getJSON('data/'+file+'.json', {
				format: "json"
			})
			.done(function(data){
				graph = graphModel(data);
				if (insp === undefined) insp = inspectra('#main_graph');
				insp.populate(graph);
				loadSuccess = true;
			})
			.fail(function() {
				loadSuccess = false;
			})
			.always(function() {
				callback();
			})
	}

	var Application = {
		initialize : function(callback) {
			
			loadJson( $('#dataset').val(), callback);
		
			$('#opacity-slider').empty().slider({
				min: 0,
				max: 1,
				value: 0.2,
				range: 'min',
				orientation: 'horizontal',
				step: 0.05,
				slide: function(evt, ui) {
					var val = Math.round(ui.value*100)/100;
					$('#opacity').val(val);
				},
				stop: _.debounce( function (evt, ui) {
					var val = Math.round(ui.value*100)/100;
					$('#opacity').val(val);
					changeAlpha();
					insp.draw();
				}, debounceInterval)
			});
			$('#dataset').on('change', function(evt, ui) {
				loadJson($(this).val(), function() { insp.draw() } );
			});

			$( "#opacity" ).val( $( "#opacity-slider" ).slider( "value" ) );
			$('#compositing').on('change', function(evt, ui) {
				insp.vis.drawingProperties({edgeCompositeOperation : $(this).val()}).draw();
			});

			['1','2'].forEach ( function (graph_num){
				$('#graph_' + graph_num + '_color').on('change', function(evt, ui) {
					insp.edgeColor(graph_num, $(this).val()).draw();
				});
			});

			$('#edge-checkbox').on('change', function(evt)  {
				insp.vis.configProperties({auto: false, drawNodes: 2, drawEdges: $(this).is(':checked') ? 2 : 0, drawLabels: 2 });
				insp.draw();
			});

			$('#node-size-slider').empty().slider({
				min: 0,
				max: 5,
				value: 1,
				range: 'min',
				orientation: 'horizontal',
				step: 0.5,
				slide: function(evt, ui) {
					var val = Math.round(ui.value*100)/100;
					$('#node-size').val(val);
				},
				stop: _.debounce(function(evt, ui) {
					var val = Math.round(ui.value*100)/100;
					$('#node-size').val(val);
					resizeNodes();
					insp.draw();
				}, debounceInterval)
			});
			$( "#node-size" ).val( $( "#node-size-slider" ).slider( "value" ) );

			['x','y'].forEach( function ( attr) { 

				$('#' + attr + '-delta-f1-cutoff-slider').empty().slider({
					min: 0.0001,
					max: 0.02,
					value: 0.02,
					range: 'min',
					orientation: 'horizontal',
					step: 0.0001,
					slide: function(evt, ui) {
						var val = Math.round(ui.value*10000)/10000;
						$('#' + attr + '-delta-f1-cutoff').val(val);
					},
					stop: _.debounce(function(evt, ui) {
						var val = Math.round(ui.value*10000)/10000;
						$('#' + attr + '-delta-f1-cutoff').val(val);
						filterClusters(attr);
						insp.draw();
					}, debounceInterval )
				});
				$('#' + attr + '-delta-f1-cutoff').val( $('#' + attr + '-delta-f1-cutoff-slider').slider("value") );

				$('#' + attr + '-min-cluster-size-slider').empty().slider({
					min: 1,
					max: 100,
					value: 2,
					range: 'min',
					orientation: 'horizontal',
					step: 1,
					slide: function(evt, ui) {
						var val = Math.round(ui.value*10000)/10000;
						$('#' + attr + '-min-cluster-size').val(val);
					},
					stop: _.debounce(function(evt, ui) {
						var val = Math.round(ui.value*10000)/10000;
						$('#' + attr + '-min-cluster-size').val(val);
						filterClusters(attr);
						insp.draw();
					}, debounceInterval)
				});
				$('#' + attr + '-min-cluster-size').val( $('#' + attr + '-min-cluster-size-slider').slider("value") );
				
			});
		
		},
		start : function() {
			if (!loadSuccess) { return; }
			// filterClusters();
			resizeNodes();
			changeAlpha();
			insp.draw();
		}
	};
	return Application;
});