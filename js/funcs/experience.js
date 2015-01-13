window.APP = window.APP || {};

var DURATION = 2000;

// setup the data
var FINAL_DATA = [
    // start
    0.1, 0.1,
    0.5, // HOOK
    0.2, 0.26, 0.4, // Act 1 climax
    0.35, 0.3, // little break
    0.4, 0.5, 0.6, 0.7, // act 2 climax
    0.58, 0.45, // little break
    0.65, 0.9, // climax

    0.3,
    // end
    0.3
];

var data = _.map(FINAL_DATA, function(d){ return FINAL_DATA[0]; });

// set it up
var n = 40;

var margin = {
    top: 60, right: 30, 
    bottom: 40, left: 40
};
var width = 980 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

// scales
var scaleX = d3.scale.linear()
    .domain([1, FINAL_DATA.length - 2])
    .range([0, width]);
var scaleY = d3.scale.linear()
    .domain([0, 1])
    .range([height, 0]);
var scaleCircleRadius = d3.scale.linear()
    .domain([0, 1])
    .range([5, 26]);

// The initial line should be linear, otherwise we get weird artifacts on the
// guide circle
var line = d3.svg.line()
    .interpolate("linear")
    .x(function(d, i) { return scaleX(i); })
    .y(function(d, i) { return scaleY(d); });

var chart = d3.select('#experience-viz')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// add clip path
chart.append('defs').append('clipPath')
    .attr('id', 'clip')
  .append('rect')
    .attr({
        width: width,
        height: height
    });

// Axes
// --------------------------------------
var axesGroup = chart.append('g').attr({ 'class': 'axes', 'opacity': 0 });
axesGroup.append('line')
    .attr({ 'class': 'x', x1: 0, x2: 0, y1: 0, y2: height });
axesGroup.append('line')
    .attr({ 'class': 'y', x1: 0, x2: scaleX(FINAL_DATA.length-1), y1: height, y2: height});

// HEADER
axesGroup.append('text')
    .attr({
        'class': 'header-label-text',
        transform: 'translate(' + [
            width / 2 - 150, -20
        ] + ')'
    })
    .text('Experience: Visualized');

// Y Label
axesGroup.append('text')
    .attr({
        'class': 'y-label-text',
        transform: 'rotate(270 100 120)'
    })
    .text('Interest');

// x label
axesGroup.append('text')
    .attr({
        'class': 'x-label-text',
        transform: 'translate(' + [
            width / 2, 
            height + 30
        ] + ')'
    })
    .text('Time');


// Draw the line
// --------------------------------------
var path = chart.append('g')
    .attr({
        'class': 'pathGroup',
        'clip-path': 'url(#clip)',
        opacity: 1,
        mask: 'url(#fade-mask)'
    })
    .append('path')
        .datum(data)
        .attr({
            'class': 'experience-line',
            d: line,
            transform: 'translate(' + [
                width, 0
            ] + ')'
        });

// Draw the smooth line with the filter (animating it is slow, so cheat a bit
// by pre-rendering then fading it in)
var smoothLine= d3.svg.line()
    .interpolate("cardinal")
    .x(function(d, i) { return scaleX(i); })
    .y(function(d, i) { return scaleY(d); });

var pathSmooth = chart.append('g')
    .attr({
        'class': 'final-filtered-path',
        'clip-path': 'url(#clip)',
        opacity: 0
    })
    .append('path')
        .datum(FINAL_DATA)
        .attr({
            'class': 'experience-line final-line',
            'filter': 'url(#filter-wavy)',
            d: smoothLine,
            transform: 'translate(' + [ 0, 0 ] + ')'
        });


// Guide circle following path
var guide = chart.append('circle')
    .attr({
        'class': 'guide',
        cx: width,
        cy: scaleY(FINAL_DATA[0]),
        r: scaleCircleRadius(FINAL_DATA[0])
    });

// ======================================
//
// Tick func
//
// ======================================
var numTicks = 0;
function tick() {
    // Check if done
    if(numTicks >= FINAL_DATA.length){
        // ALL DONE - do some effects
        requestAnimationFrame(function(){ 
            var fadeInDuration = 2000;

            // fade in those axes
            axesGroup.transition().duration(fadeInDuration)
                .attr({ opacity: 1 });

            // For the path that was already drawn, smooth it out
            var smoothLine= d3.svg.line()
                .interpolate("cardinal")
                .x(function(d, i) { return scaleX(i); })
                .y(function(d, i) { return scaleY(d); });
            path.attr({
                d: smoothLine,
                transform: null
            });

            // fade out the gradient
            d3.select('#gradient-fade').transition().duration(fadeInDuration)
                .attr({ x2: '-100%', x1: '0%' });

            d3.select('.pathGroup').transition().duration(fadeInDuration/2)
                .attr({ opacity: 0 });

            setTimeout(function(){ requestAnimationFrame(function(){
                // Fade in the filtered group
                d3.select('.final-filtered-path').transition().duration(fadeInDuration)
                    .attr({ opacity: 1 });
            }); }, 400);


        });

        return false;
    }

    // push a new data point onto the back
    data.push(FINAL_DATA[numTicks]);

    var duration = DURATION;
    // start immediately first time
    if(numTicks < 3){ duration = 1; } 

    // redraw the line, and slide it to the left
    path
        .attr("d", line)
        .attr("transform", null)
        .transition()
            .duration(duration)
            .ease("linear")
            .attr({
                "transform": "translate(" + [
                    scaleX(0),
                    0
                ] + ")"
            })
            .each("end", tick);

    // move the guide circle
    var index = numTicks-1 >= 0 ? numTicks-1 : 0;
    guide.transition().duration(DURATION).ease('linear')
        .attr({
            cy: scaleY(FINAL_DATA[index]),
            r: scaleCircleRadius(FINAL_DATA[index])
        });

    numTicks++;
    data.shift();
}
tick();
