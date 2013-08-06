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

	var Application = {
		initialize : function(callback) {
			var graph;

			$.getJSON('data/test3.json', {
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
		},
		start : function() {
			if (!loadSuccess) { return; }
			insp.draw();
		}
	};
	return Application;
});