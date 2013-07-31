require.config({
    paths: {
        jquery: '../bower_components/jquery/jquery',
        jqueryui: "../bower_components/jqueryuibootstrap/js/jquery-ui-1.9.2.custom.min",
        bootstrap: 'vendor/bootstrap',
        underscore: '../bower_components/underscore/underscore',
        d3: '../bower_components/d3/d3',
        sigma: '../bower_components/sigma.js/build/sigma.full',
        rbush: '../bower_components/rbush/rbush',
        jDataView: '../bower_components/jDataView/src/jDataView',
        jBinary : '../bower_components/jBinary/src/jBinary',
        crossfilter: '../bower_components/crossfilter/crossfilter'
    },
    shim: {
        underscore: {
            exports : '_'
        },
        crossfilter: {
            exports : 'crossfilter'
        },
        jqueryui: {
            deps: ["jquery"],
            exports: "$"
        },
        d3: {
            exports: "d3"
        },
        sigma: {
            exports: "sigma"
        },
        rbush : {
            exports: "rbush"
        },
        bootstrap: {
            deps: ['jquery', 'jqueryui'],
            exports: 'bootstrap'
        }
    }
});

require(['app', 'underscore', 'jquery', 'jqueryui', 'bootstrap', 'd3', 'rbush', 'sigma'], function (app, _, $) {
    'use strict';
    app.initialize(function(){
        app.start();
    });
    
});
