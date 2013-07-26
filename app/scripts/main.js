require.config({
    paths: {
        jquery: '../bower_components/jquery/jquery',
        "jQuery-ui": "../bower_components/jquery-ui/ui/jquery-ui",
        bootstrap: 'vendor/bootstrap',
        underscore: '../bower_components/underscore/underscore',
        sigma: 'vendor/sigma',
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
        "jQuery-ui": {
            deps: ["jquery"],
            exports: "$"
        },
        sigma: {
            exports: "sigma"
        },
        shim : {
            exports: "rbush"
        },
        bootstrap: {
            deps: ['jquery', 'jQuery-ui'],
            exports: 'bootstrap'
        }
    }
});

require(['app', 'underscore', 'jquery', 'bootstrap', 'rbush'], function (app, _, $) {
    'use strict';
    app.initialize();
    app.start();
});
