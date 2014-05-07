require.config({
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        jqueryui: "../bower_components/jqueryuibootstrap/js/jquery-ui-1.9.2.custom.min",
        underscore: '../bower_components/underscore/underscore',
        rbush: '../bower_components/rbush/rbush',
         "mediator-js": '../bower_components/mediator-js/lib/mediator',
        jDataView: '../bower_components/jDataView/src/jDataView',
        jBinary : '../bower_components/jBinary/src/jBinary',
        crossfilter: '../bower_components/crossfilter/crossfilter',
        handlebars: '../bower_components/handlebars/handlebars',
        fineuploader: 'vendor/fineuploader'
    },
    shim: {
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
	    handlebars: {
            exports: 'Handlebars',
            init: function() {
                this.Handlebars = Handlebars;
                return this.Handlebars;
            }
        },
        fineuploader: {
            exports: "qq"
        }
    }
});

require(['app', 'underscore', 'jquery', 'jqueryui', 'rbush', 'fineuploader'], function (app, _, $) {
    'use strict';
    $.when(app.initialize())
    .done(app.start());

});
