define([
], function() {

var __ = {
	container: 'body',
	dimKey : '',
	data : [],
	width: 300,
	height:200,
	margin: {
		top: 3,
		right: 5,
		bottom: 2,
		left: 2
	},
	padding: {
		top: 3,
		right: 5,
		bottom: 2,
		left: 2
	},
	model : null
};

 var events = d3.dispatch.apply(this,["select"].concat(d3.keys(__))),
      outerWidth = function() { return __.width - __.margin.right - __.margin.left },
      outerHeight = function() { return __.height - __.margin.top - __.margin.bottom },
      plotWidth = function() { return outerWidth() - padding.right - padding.left},
      plotHeight = function() { return outerHeight() - padding.top - padding.bottom },
      displayWidth = function() { return plotWidth() - 20;},
      displayHeight = function() { return plotHeight() - 20;};

function initializeParameters(config) {
	_.extend( __, config);
	d3.rebind(Histogram, events, "on");
}

//binned data  = [
//x1, count1,
//x2, count2,
//...
//]

function initializeData() {

	__.data = __.model.addDimension(__.dimKey).binDimension(__.dimKey, 0.001);

	__.xScale = d3.scale.linear()
    .domain([0, 1])
    .range([0, plotWidth()]);

	__.yScale = d3.scale.linear()
    .domain([0, d3.max(__.data, function(d) { return d.y; })])
    .range([plotHeight(), 0]);
}

function drawHistogram() {
	
	d3.select(__.container +' svg.histogramSelector').remove();

	__.svg = d3.select(__.container).append('svg')
						.attr('class', 'histogramSelector')
						.attr('width', __.width)
						.attr('height', __.height);

	var defs = __.svg.append('defs');
			
		defs.append("svg:clipPath")
            .attr("id", "plot_clip")
            .append("svg:rect")
            .attr("id", "clip-rect")
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("width", outerWidth())
            .attr("height", outerHeight());

	var viewbox = __.svg.append('g')
 			.attr('clip','url(#plot_clip)')
 			.attr('class','viewbox')
			.attr('transform','translate(' + margin.left + ',' + margin.top + ')');

	var plot = viewbox.append('g');

	var bar = plot.selectAll(".bar")
			.data(data)
			.enter().append("g")
			.attr("class", "bar")
			.attr("transform", function(d) { return "translate(" + __.xScale(d.x) + "," + __.yScale(d.y) + ")"; });
			
		bar.append("rect")
    		.attr("x", 1)
    		.attr("width", function(d) { return  __.xScale(d.dx) - 1;})
    		.attr("height", function(d) { return outerHeight() - __.yScale(d.y); });

		bar.on('mouseover', mousemove_fn)
			.on('mousemove', mousemove_fn)
			.on('mouseout', mouseout_fn)
			.on('click', function( bar ) {
				var val = bar.x + bar.dx;

		})

}

function drawHoverIndicator(position) {
	__.svg.append('rect')
		.attr('class','hoverIndication')
		.attr('transform','translate(' + position + ')');
}

function mousemove_fn( bar ) {
	var position = bar.x + bar.dx;
	if (__.svg.select('.hoverIndication').empty()) drawHoverIndicator( position );
		__.svg.select('.hoverIndication')
			.attr('transform','translate(' + __.xScale.invert(position) + ')');
}

function mouseout_fn() {
	__.svg.select('.hoverIndication').remove();
}

var Histogram = {

	init : function(config) {
		initializeParameters(config);
		return this;
	},
	config : function(config) {
		if (arguments.length >= 1) {
			initializeParameters(config);
			return this;
		}
		return __;
	},
	binData : function(d) {
		if (arguments.length >= 1) {
			__.data = d;
			initializeData();
			return this;
		}
		return __.data;
	},
	draw : function() {
		drawHistogram();
	}
};
return Histogram;
});