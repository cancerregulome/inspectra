/*global define */
define([
	 'jquery'
	,'underscore'
	,'model/graph'
	,'vis/inspectra'
], function ($, _, graphModel, inspectra) {
    'use strict';

	var insp;
	var graph;
	var lastFilterAttr = 'x';
	var debounceInterval = 500;

	function filterClusters(attr) {
		attr = attr || lastFilterAttr;
		lastFilterAttr = attr;
		var cutoff = $('#' + attr + '-delta-f1-cutoff-slider').slider("value"),
			graph = attr === 'x' ? 'graph1' : 'graph2',
		 	minSize = $('#' + attr + '-min-cluster-size-slider').slider("value");
		insp.graph.assignClustersAtCutoff.call(insp.graph, function(node1, node2) { 
			var delta = Math.abs(node2[graph].f1 - node1[graph].f1);
			return (delta <= cutoff); } 
			, minSize, attr);
		insp.populate(insp.graph);
		insp.drawClusters();
	}

	function setNodeSize(nodeSize) {
		if (nodeSize === undefined) nodeSize = $('#node-size-slider').slider("value");
		insp.vis.graphProperties({minNodeSize: nodeSize, maxNodeSize: nodeSize});
	}

	function getNodeSize() {
		return insp.vis.graphProperties("minNodeSize");
	}

	function setAlpha(alpha) {
		if (alpha === undefined) alpha = $('#opacity-slider').slider("value");
		insp.vis.drawingProperties({edgeAlpha: alpha})
	}

	function getAlpha() {
		return insp.vis.drawingProperties("edgeAlpha");
	}

	function loadJson(file, successCallback, failCallback, alwaysCallback) {
		$.getJSON('view?id='+file, {
				format: "json"
			})
			.done(function(data){
				graph = graphModel(data);
				if (insp === undefined) insp = inspectra('#main_graph');
				insp.populate(graph);
				if ( typeof successCallback  === 'function' ) {
					successCallback();
				}
			})
			.fail(function() {
				if ( typeof failCallback  === 'function' ) {
					failCallback();
				}
			})
			.always(function() {
				if ( typeof alwaysCallback  === 'function' ) {
					alwaysCallback();
				}
			});
	}

	function createUploader() {
		var uploader = new qq.FineUploader({
			element: $('#uploader').get(0),
			request: {
				endpoint: '/upload',
				inputName: 'graph'
			},
			validation: {
				allowedExtensions: ['json'],
				sizeLimit: 1024 * 1024 * 2 // 2 MB = 2* 1024 * 1024 bytes
			},
			text: {
				uploadButton: '<span><i class="icon-upload icon-white"></i></span>',
				dragZone : '<i class="icon-upload"></i>'
			},
			editFilename: true,
			template: '<div class="qq-uploader">' + 
			'<div class="qq-upload-drop-area btn btn-warning" style="width: auto; height: auto;">{dragZoneText}</div>' + 
			'<div class="qq-upload-button btn btn-success" style="width: auto;">{uploadButtonText}</div>' + 
			'<span class="qq-drop-processing"><span>{dropProcessingText}</span><span class="qq-drop-processing-spinner"></span></span>' + 
			'</div>' +
			'<ul class="qq-upload-list" style="margin-top: 10px; text-align: center;"></ul>',
			
			classes: {
				success: 'alert alert-success',
				fail: 'alert alert-error'
			},
			callbacks: {
        		onComplete: function (id, name, resp, xhr) {
					if (resp.success) {
						populateDataSelect($('#dataset'));
					}
				}
			}
		});
	}

	function populateDataSelect($el,  successCallback, failCallback, alwaysCallback) {
		$.getJSON('view', {
				format: "json"
			})
			.done(function(graphObj){
				if (graphObj.graphs) {
					$el.empty();
					graphObj.graphs.forEach( function (g) {
						$el.append($('<option value="' + g.label+ '">').html(g.label));
					});				
					if ( typeof successCallback  === 'function' ) {
						successCallback();
					}
				} else {
					if ( typeof failCallback  === 'function' ) {
						failCallback();
					}
				}
			})
			.fail(function() {
				if ( typeof failCallback  === 'function' ) {
					failCallback();
				}
			})
			.always(function() {
				if ( typeof alwaysCallback  === 'function' ) {
					alwaysCallback();
				}
			});

	}

	var Application = {
		initialize : function(successCallback) {
			
			populateDataSelect($('#dataset'), function () {
				$('#dataset option:first-child').prop('selected', true);
				loadJson( $('#dataset').val(), successCallback);
			});
		
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
				change: _.debounce( function (evt, ui) {
					var val = Math.round(ui.value*100)/100;
					if (val === getAlpha()) {return false;}
					$('#opacity').val(val);
					setAlpha(val);
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

			$('#background-color-checkbox').on('change', function(evt)  {
				insp.$el.css({background: $(this).is(':checked') ? '#000' : '#FFF' });
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
				change: _.debounce(function(evt, ui) {
					var val = Math.round(ui.value*100)/100;
					if (val === getNodeSize()) {return false;}
					$('#node-size').val(val);
					setNodeSize();
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
					change: _.debounce(function(evt, ui) {
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
					change: _.debounce(function(evt, ui) {
						var val = Math.round(ui.value*10000)/10000;
						$('#' + attr + '-min-cluster-size').val(val);
						filterClusters(attr);
						insp.draw();
					}, debounceInterval)
				});
				$('#' + attr + '-min-cluster-size').val( $('#' + attr + '-min-cluster-size-slider').slider("value") );
				
			});
			createUploader();
		
		},
		start : function() {
			setNodeSize();
			setAlpha();
			insp.draw();
		}
	};
	return Application;
});