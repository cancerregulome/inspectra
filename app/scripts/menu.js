define([
	'mediator-js'
	,'vis/histogram'
], function(mediator) {
'use strict'

var __ = {
	datasetList : '#dataset'
}

var debounceInterval = 500,
	fileLimitMB = 12;

function initializeMenu( deferred ){
	setupSideMenu();
	subscribeListeners();
	deferred.resolve();
}

function subscribeListeners() {
	mediator.subscribe('application:controller:PopulateDatasetListSelect', reloadDatasetList );
}

function reloadDatasetList(datasets) {
		populateDataSelect(datasets, $(__.datasetList));
		$('#dataset option:first-child').prop('selected', true);
		var selectedDataset = $('#dataset option:first-child').val();
		mediator.publish('application:menu:DatasetListPopulated', selectedDataset);
}

function setupSideMenu() {
	$('#sideMenuToggle').on('click', function () {
	    $('#mainPanel').toggleClass('col-md-10 col-md-8').toggleClass('col-lg-10 col-lg-8');
	    $('#sideMenu').toggleClass('col-md-2 col-md-4').toggleClass('col-lg-2 col-lg-4');
	    $('#sideMenuButton').toggleClass('glyphicon-chevron-right glyphicon-chevron-left');
	});

	$('#executeBtn').on('click', function() {
		mediator.publish('application:menu:loadData', Menu.state());
	});

	$('#opacity-slider').empty().slider({
				min: 0,
				max: 1,
				value: 0.05,
				range: 'min',
				orientation: 'horizontal',
				step: 0.05,
				slide: function(evt, ui) {
					var val = Math.round(ui.value*100)/100;
					$('#opacity').val(val);
				},
				change: _.debounce( function (evt, ui) {
					var val = Math.round(ui.value*100)/100;
					$('#opacity').val(val);
					mediator.publish('application:menu:DisplayPanelChanged', Menu.state());
				}, debounceInterval)
			});
			$(__.datasetList).on('change', function(evt, ui) {
					mediator.publish('application:menu:DatasetSelected', $(this).val());
			});

			$( "#opacity" ).val( $( "#opacity-slider" ).slider( "value" ) );
			$('#compositing').on('change', function(evt, ui) {
				mediator.publish('application:menu:DisplayPanelChanged', Menu.state());
			});

			['1','2'].forEach ( function (graph_num){
				$('#graph_' + graph_num + '_color').on('change', function(evt, ui) {
					mediator.publish('application:menu:DisplayPanelChanged', Menu.state());
				});
			});

			$('#edge-checkbox').on('change', function(evt)  {
				mediator.publish('application:menu:DisplayPanelChanged', Menu.state());
			});

			$('#graph-1-color').on('change', function(evt)  {
				mediator.publish('application:menu:DisplayPanelChanged', Menu.state());
			});
			
			$('#graph-2-color').on('change', function(evt)  {
				mediator.publish('application:menu:DisplayPanelChanged', Menu.state());
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
					$('#node-size').val(val);
					mediator.publish('application:menu:DisplayPanelChanged', Menu.state());
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
						mediator.publish('application:menu:ClusterPanelChanged', Menu.state());
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
						mediator.publish('application:menu:ClusterPanelChanged', Menu.state());
					}, debounceInterval)
				});
				$('#' + attr + '-min-cluster-size').val( $('#' + attr + '-min-cluster-size-slider').slider("value") );
				
			});
			createUploader();
}

function getSelectedValue(elementId) {
			var value = $('#' + elementId + ' :selected').val();
			if (value === "All") {value = "*";}
			return value
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
				sizeLimit: 1024 * 1024 * fileLimitMB // 1 MB = 1024 * 1024 bytes
			},
			text: {
				uploadButton: '<span class="glyphicon glyphicon-upload"></span>',
				dragZone: '<span class="glyphicon glyphicon-upload"></span>'
			},
			editFilename: true,
			template: '<div class="qq-uploader">' + '<div class="qq-upload-drop-area btn btn-warning" style="width: auto; height: auto;">{dragZoneText}</div>' + '<div class="qq-upload-button btn btn-success" style="width: auto;">{uploadButtonText}</div>' + '<span class="qq-drop-processing"><span>{dropProcessingText}</span><span class="qq-drop-processing-spinner"></span></span>' + '</div>' + '<ul class="qq-upload-list" style="margin-top: 10px; text-align: center;"></ul>',

			classes: {
				success: 'alert alert-success',
				fail: 'alert alert-error'
			},
			callbacks: {
				onComplete: function(id, name, resp, xhr) {
					if (resp.success) {
						mediator.publish('application:data:DataUploadComplete');
					}
				}
			}
		});
	}

		function populateDataSelect(datasets, $el) {
				if (datasets && datasets.length) {
					$el.empty();
					datasets.forEach(function(g) {
						$el.append($('<option value="' + g.label + '">').html(g.label));
					});
				}
			}

	var Menu = {
		initialize : function(  ) {
			var deferred = $.Deferred();
			initializeMenu( deferred );
			return deferred.promise();
		},
		state: function ( ) {
			return { 
				drawRules : {
					drawEdges: $('#edge-checkbox').is(':checked') ? 1 : 0,
				},
				drawingProperties : {
					edgeCompositeOperation: $('#compositing :selected').val(),
					edgeAlpha : $( "#opacity-slider" ).slider( "value" ),
					graph1Color: $('#graph_1_color :selected').val(),
					graph2Color: $('#graph_2_color :selected').val()
				},
			 	clusterProperties : {
			 		x: {
			 			delta: $('#x-delta-f1-cutoff-slider').slider('value'),
			 			minSize: $('#x-min-cluster-size-slider').slider('value')
			 		},
			 		y: {
			 			delta: $('#y-delta-f1-cutoff-slider').slider('value'),
			 			minSize: $('#y-min-cluster-size-slider').slider('value')
			 		}
			 	},
			 	graphProperties : {
			 		nodeSize :  $( "#node-size-slider" ).slider( "value" )
			 	}
			};
		}

	};
	return Menu;
});