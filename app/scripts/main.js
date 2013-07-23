require.config({
    paths: {
        jquery: '../bower_components/jquery/jquery',
        "jQuery-ui": "../bower_components/jquery-ui/ui/jquery-ui",
        bootstrap: 'vendor/bootstrap',
        underscore: '../bower_components/underscore/underscore',
        sigma: 'vendor/sigma',
        jDataView: '../bower_components/jDataView/src/jDataView',
        jBinary : '../bower_components/jBinary/src/jBinary',
        d3 : '../bower_components/d3/d3',
        crossfilter: '../bower_components/crossfilter/crossfilter'
    },
    shim: {
        underscore: {
            exports : '_'
        },
        crossfilter: {
            exports : 'crossfilter'
        },
        "jQuery-ui": {
            deps: ["jquery"],
            exports: "$"
        },
        d3 : {
            exports: "d3"
        },
        sigma: {
            exports: "sigma"
        },
        bootstrap: {
            deps: ['jquery', 'jQuery-ui'],
            exports: 'bootstrap'
        }
    }
});

require(['app', 'underscore', 'jquery', 'bootstrap', 'vivagraph'], function (app, _, $) {
    'use strict';
    app.initialize();
    app.start();
});
