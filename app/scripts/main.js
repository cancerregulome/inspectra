require.config({
    paths: {
        jquery: '../bower_components/jquery/jquery',
        jqueryui: "../bower_components/jqueryuibootstrap/js/jquery-ui-1.9.2.custom.min",
        bootstrap: 'vendor/bootstrap',
        underscore: '../bower_components/underscore/underscore',
        rbush: '../bower_components/rbush/rbush',
        jDataView: '../bower_components/jDataView/src/jDataView',
        jBinary : '../bower_components/jBinary/src/jBinary',
        crossfilter: '../bower_components/crossfilter/crossfilter',
        fineuploader: 'vendor/fineuploader'
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
        rbush : {
            exports: "rbush"
        },
        bootstrap: {
            deps: ['jquery', 'jqueryui'],
            exports: 'bootstrap'
        },
        fineuploader: {
            exports: "qq"
        }
    }
});

require(['app', 'underscore', 'jquery', 'jqueryui', 'bootstrap', 'rbush', 'fineuploader'], function (app, _, $) {
    'use strict';
    app.initialize(function(){
        app.start();
    });
    
});
