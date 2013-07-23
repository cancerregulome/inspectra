/*global define */
define([
	 'jquery'
	,'underscore'
	,'vis/inspectra'
], function ($, _, inspectra) {
    'use strict';

	var Application = {
		initialize : function() {
			inspectra.drawGraph('#main_graph');
		},
		start : function() {
		}
	};
	return Application;
});