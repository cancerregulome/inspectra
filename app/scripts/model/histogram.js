define([
	  'underscore'
	, 'crossfilter'  //rbush installs itself on the global object
], function (_, cf) {
'use strict'

return function(dataset) {

/* Internal Filter code */

 var cf_obj, all,
     filter = {},
     group = {};

 var Filter = function(data) {
             cf_obj = crossfilter(data);
                all = cf_obj.groupAll();
                return Filter;
            };
    Filter.currentSize = function() {
                return cf_obj.size();
            };

	Filter.totalSize = function() {
	    	return all.value();
		};

	Filter.Dimensions = function() {
		    return Object.keys(filter);
		};

	Filter.has = function(label) {
		    if ( filter[ label ] === undefined ) return false;
		    return true;
		};

	Filter.addDimension = function( label , property ) { //property is optional
		    if  ( arguments.length < 2 ) property = label;
		    if (Filter.has(label)) return Filter;
		    filter[label] = cf_obj.dimension( function (d) { return d[property]; });
		    return Filter;
		};

	Filter.removeDimension = function( label) {
		if (Filter.has(label)) filter[label].dispose();
		return Filter;
	}

	Filter.binDimension = function( label, binSize ) { //property is optional
	    if ( !Filter.has( label ) ) Filter.addDimension(label, label);
	    if ( group[label] !== undefined ) group[label].dispose();
	    group[label] = filter[label].group(function(d) { return Math.floor(d / binSize) * binSize; });
	    return Filter;
	};

	Filter.filterDimension = function( label, range ) {
	    if ( !Filter.has(label) ) Filter.addDimension( label );
	    if ( range.length != 2 || !(range.every(isFinite))  ) { 
	        // a set of categorical values
	        filter[label].filterFunction( function (val) { return range.indexOf(val) >= 0; } );
	    } else { 
	        // a low, high pair
	         filter[label].filterRange( [range[0], range[1]].map(parseFloat) );
	    }
	    return Filter;
	};

	Filter.resetFilter = function ( label ) {
	    filter[label].filterAll();
	    return Filter;
	};

	Filter.getBins = function( label ) {
	    if ( group[label] === undefined ) return [];
	    return group[label].top( Infinity ).orderNatural();
	};

	Filter.getBinLabels = function( label ) {
	    if ( group[label] === undefined ) return [];
	    return group[label].top( Infinity ).map(function(g) { return g['key']; } ).orderNatural();
	};

	Filter.getRows = function( label, num ) {
	    if (arguments.length < 2) num = Infinity;
	    if (arguments.length < 1) label = Object.keys(filter)[0];
	    return filter[label].top(num);
	};


/* Eventing code*/
var eventLog = {
	'filtered' : []
};

function dispatch(event) {
	var i = -1;
	var arg, args =[];
	while (arg = arguments[++i] ) args[i] = arg;
	eventLog[event].forEach(function(evt) {
		evt.fn.apply(this, args;
	});
}

var histFilter = Filter(dataset);

/*public object */
var histogramModel = {
	binDimension : function(dim) {
		histFilter.binDimension(dim);
		return this;
	},
	filterDimension: function(dim, filter) {
		histFilter.filterDimension(dim, filter);
		dispatch('filtered', dim);
		return this;
	},
	getBins: function(dim) {
		return histFilter.getBins(dim);
	},
	on : function(event, fn) {
		eventLog[event].push({
			fn : fn,
			
		});
		return this;
	},
	off : function(event, fn) {
		eventLog[event] = eventLog[event].filter(function (evt) {
			return (evt.fn !== fn);
		});
		return this;
	}
};

return histogramModel;
};

});
