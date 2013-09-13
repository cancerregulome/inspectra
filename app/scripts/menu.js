define([
	'mediator-js'
], function(mediator) {
'use strict'

var debounceInterval = 500,
	fileLimitMB = 12;

function initializeMenu( deferred ){
	setupSideMenu();
	subscribeListeners();
	deferred.resolve();
}

function reloadDatasetList(datasets) {

		populateDataSelect(datasets, '#data', function() {
				$('#dataset option:first-child').prop('selected', true);
				mediator.publsh('application:menu:DatasetListPopulated');
			});
}

function subscribeListeners() {
	mediator.subscribe('application:data:DatasetListLoaded', reloadDatasetList );
		
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
				insp.vis.drawingProperties({edgeCompositeOperation : $(this).val()});
				insp.draw();
			});

			['1','2'].forEach ( function (graph_num){
				$('#graph_' + graph_num + '_color').on('change', function(evt, ui) {
					insp.edgeColor(graph_num, $(this).val());
					insp.draw();
				});
			});

			$('#edge-checkbox').on('change', function(evt)  {
				__.visConfig.drawEdges = $(this).is(':checked') ? 1 : 0;
				insp.vis.configProperties(__.visConfig);
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
					renderOnlyNodes();
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
						renderOnlyNodes();
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
						renderOnlyNodes();
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

		function populateDataSelect(datasets, $el, callback) {
				if (datsets && datasets.length) {
					$el.empty();
					datasets.forEach(function(g) {
						$el.append($('<option value="' + g.label + '">').html(g.label));
					});
					if (typeof callback === 'function') {
						callback();
					}
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
				target : getSelectedValue('inputTarget'),
			 	model : getSelectedValue('inputModel'),
			 	test : getSelectedValue('inputTest')
			};
		}

	};
	return Menu;
});