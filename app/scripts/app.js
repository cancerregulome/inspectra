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

	function filterClusters() {
		var cutoff = $('#delta-f1-cutoff').val();
		var minSize = $('#min-cluster-size').val();
		insp.graph.assignClustersAtCutoff(function(node) { return node.graph1.f1;}, cutoff, minSize);
		insp.populate(insp.graph).draw();
	}

	var Application = {
		initialize : function(callback) {
			var graph;

			$.getJSON('data/test4.json', {
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
					insp.vis.drawingProperties({edgeAlpha: val}).draw();
				}
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

			$('#delta-f1-cutoff-slider').empty().slider({
				min: 0,
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
				}
			});
			$('#delta-f1-cutoff').val( $('#delta-f1-cutoff-slider').slider("value") );

			$('#min-cluster-size-slider').empty().slider({
				min: 1,
				max: 100,
				value: 1,
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
				}
			});
			$('#min-cluster-size').val( $('#min-cluster-size-slider').slider("value") );
		
		},
		start : function() {
			if (!loadSuccess) { return; }
			insp.draw();
		}
	};
	return Application;
});