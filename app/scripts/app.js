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

	function filterClusters() {
		var cutoff = $('#delta-f1-cutoff-slider').slider("value");
		var minSize = $('#min-cluster-size-slider').slider("value");
		insp.graph.assignClustersAtCutoff(function(node) { return node.graph1.f1;}, cutoff, minSize);
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
				insp = inspectra('#main_graph').populate(graph);
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
				value: 0.5,
				range: 'min',
				orientation: 'horizontal',
				step: 0.05,
				slide: function(evt, ui) {
					var val = Math.round(ui.value*100)/100;
					$('#opacity').val(val);
				},
				stop: function(evt, ui) {
					var val = Math.round(ui.value*100)/100;
					$('#opacity').val(val);
					changeAlpha();
					insp.draw();
				}
			});
			$('#dataset').on('change', function(evt, ui) {
				loadJson($(this).val(), function() { insp.draw()} );
			});

			$( "#opacity" ).val( $( "#opacity-slider" ).slider( "value" ) );
			$('#compositing').on('change', function(evt, ui) {
				insp.vis.drawingProperties({edgeCompositeOperation : $(this).val()}).draw();
			});
			$('#graph_1_color').on('change', function(evt, ui) {
				insp.edgeColor('1', $(this).val()).draw();
			});
			$('#graph_2_color').on('change', function(evt, ui) {
				insp.edgeColor('2', $(this).val()).draw();
			});
			$('#edge-checkbox').on('change', function(evt)  {
				insp.vis.configProperties({drawEdges: $(this).is(':checked')});
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
				stop: function(evt, ui) {
					var val = Math.round(ui.value*100)/100;
					$('#node-size').val(val);
					resizeNodes();
					insp.draw();
				}
			});
			$( "#node-size" ).val( $( "#node-size-slider" ).slider( "value" ) );

			$('#delta-f1-cutoff-slider').empty().slider({
				min: 0.0001,
				max: 0.02,
				value: 0.02,
				range: 'min',
				orientation: 'horizontal',
				step: 0.0001,
				slide: function(evt, ui) {
					var val = Math.round(ui.value*10000)/10000;
					$('#delta-f1-cutoff').val(val);
				},
				stop: function(evt, ui) {
					var val = Math.round(ui.value*10000)/10000;
					$('#delta-f1-cutoff').val(val);
					filterClusters();
					insp.draw();
				}
			});
			$('#delta-f1-cutoff').val( $('#delta-f1-cutoff-slider').slider("value") );

			$('#min-cluster-size-slider').empty().slider({
				min: 1,
				max: 100,
				value: 2,
				range: 'min',
				orientation: 'horizontal',
				step: 1,
				slide: function(evt, ui) {
					var val = Math.round(ui.value*10000)/10000;
					$('#min-cluster-size').val(val);
				},
				stop: function(evt, ui) {
					var val = Math.round(ui.value*10000)/10000;
					$('#min-cluster-size').val(val);
					filterClusters();
					insp.draw();
				}
			});
			$('#min-cluster-size').val( $('#min-cluster-size-slider').slider("value") );
		
		},
		start : function() {
			if (!loadSuccess) { return; }
			filterClusters();
			resizeNodes();
			changeAlpha();
			insp.draw();
		}
	};
	return Application;
});