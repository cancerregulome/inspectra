define([
  'jquery'
  , 'underscore'
  , 'mediator'
  , 'helpers/titleCaps'
], function ( $, _, mediator, titleCaps ) {
'use strict'

var defaults = {
};

var __ = {};

function subscribeListeners() {
  mediator.subscribe('application:controller:EnrichGeneList', enrichGeneList);
}

var regexp = /^KEGG_/i;

function formatPathwayList(obj) {
  obj.results.list1.forEach(function(pathway) {
    pathway.name = pathway.name.replace(regexp,'').replace(/_/g,' ');
    pathway.name = pathway.name.split(' ')
      .map(function(token) { return token.length > 3 ? token.toLowerCase() : token; })
      .join(' ');
    pathway.name = titleCaps(pathway.name.replace(regexp,'').replace(/_/g,' '));
  });
  return obj;
}

//input : array of gene labels
// eg. ['FOXA1', 'TTSP' ,'TP53']

function publishGeneListEnrichment(enrichmentObj) {
  console.log('Enriched!');
  enrichmentObj = formatPathwayList(enrichmentObj);
  mediator.publish('application:modules:enrich:EnrichmentResults', enrichmentObj);
}

function errorOnGeneListEnrichment(obj) {
  console.warn('Failed to enrich gene list: ' + JSON.stringify(obj) );
}

function enrichGeneList( geneList ) {

  $.ajax({
    type: 'POST',
    url : '/ponzi',
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
    data : JSON.stringify( { lists : {list1: geneList} } )
  })
  .done(publishGeneListEnrichment)
  .fail(errorOnGeneListEnrichment);

}

var PonziAdapter = {
  initialize: function(config) {
    _.extend(__, defaults, config);
    subscribeListeners();
  }
};
return PonziAdapter;
});
