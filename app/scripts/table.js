define([
  'jquery'
  , 'underscore'
  , 'templates'
  , 'mediator'
  ], function( $, _, JST, mediator) {

    var template = JST['app/scripts/templates/table.hbs'];

    function subscribeListeners() {
      mediator.subscribe('application:controller:UpdateEnrichmentTable', renderTable);
    }

    function renderTable(tableObj) {
        $('#enrichment').html(template({list: tableObj.results.list1}));
    }

    var Table = {
      initialize : function() {
        subscribeListeners();
      }
    };

    return Table;

  } );
