
// read data
// When the browser window is resized, responsify() is called.
//d3.select(window).on("resize", makeResponsive);

// When the browser loads, makeResponsive() is called.
makeResponsive();

// The code for the chart is wrapped inside a function that automatically resizes the chart
function makeResponsive() {
  // if the SVG area isn't empty when the browser loads, remove it and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // SVG wrapper dimensions are determined by the current width and height of the browser window.
  // var svgWidth = parseInt(d3.select(".chart").style("width"));
  // var svgHeight = svgWidth - (svgWidth / 4);

  // Grab the width of the containing box
  var svgWidth = parseInt(d3.select("#scatter").style("width"));
  console.log(svgWidth);
  // Designate the height of the graph
  var svgHeight = svgWidth - svgWidth / 3.9;


  // var svgWidth = window.innerWidth;
  // var svgHeight = window.innerHeight;

  // set up margin and chart dimensions
  var margin = {top: 20, right: 20, bottom: 120, left: 120};
  var chart_width = svgWidth - margin.left - margin.right,
      chart_height = svgHeight - margin.top - margin.bottom;
  
  // setup fill color
  // var cValue = function(d) { return d.state;},
  //   color = d3.scale.category20();

  // Create the graph canvas
  var chart = d3
    .select("#scatter")
    .append("svg")
      .attr("height", svgHeight)
      .attr("width", svgWidth) 
      .classed("chart", true)   
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  // ***********************************
  // circle radius 
  // ***********************************
  var circRadius;
  function crGet() {
    if (chart_width <= 530) {
      circRadius = 5;
    }
    else {
      circRadius = 10;
    }
  }
  crGet();

  // ***********************************
  // Bottom axis
  // ***********************************
  // create a group place holder for x axis text 
  chart.append("g")
      .classed("xtext", true);
  var xtext = d3.select(".xtext")

  function xTextRefresh(){
     xtext
        .attr(
        "transform",
        "translate(" + ((chart_width) / 2 - margin.left) + " ," + 
              (chart_height + margin.bottom) + ")"
          );
  }

  xTextRefresh();

  // x-axis labels
  xtext.append("text")          
    .classed("xlabel active x", true)
    .attr("y", -70)
    .attr("data-axis-name", "poverty")
    .attr("data-axis", "x")
    .text("Poverty (%)");

  xtext.append("text")
    .classed("xlabel inactive x", true)
    .attr("y", -50)
    .attr("data-axis-name", "age")
    .attr("data-axis", "x")
    .text("Age (Median)");

  xtext.append("text")
    .classed("xlabel inactive x", true)
    .attr("y", -30)
    .attr("data-axis-name", "household")
    .attr("data-axis", "x")
    .text("Household Income (Median)");

  // ***********************************
  // Left axis
  // ***********************************
  // create a group place holder for y axis text (left)
  chart.append("g")
      .classed("ytext", true);
  var ytext = d3.select(".ytext");

  var leftx = margin.left;
  var lefty = (chart_height/2);

  function yTextRefresh(){
     ytext
        .attr(
        "transform",
        "translate(" + leftx + " ," + 
              lefty + ")rotate(-90)"
          );
  }

  yTextRefresh();

  // y-axis labels
  ytext.append("text")
    .classed("label active y", true)
    .attr("data-axis-name", "healthcare")    
    .attr("data-axis", "y")
    .attr("y", "-150")    
    .style("text-anchor", "middle")
    .text("Lacks Healthcare (%)");

  ytext.append("text")
    .classed("label inactive y", true)
    .attr("data-axis-name", "smokes")   
    .attr("data-axis", "y")
    .attr("y", "-170")     
    .style("text-anchor", "middle")
    .text("Smokes (%)");

  ytext.append("text")
    .classed("label inactive y", true)
    .attr("data-axis-name", "obese")   
    .attr("data-axis", "y")
    .attr("y", "-190")      
    .style("text-anchor", "middle")
    .text("Obese (%)");

  // add the toolTip area to the webpage
  var toolTip = d3.select(".chart").append("div")
    .classed("toolTip", true)
    .style("opacity", 0);

  // load data
  d3.csv("../static/DataSets/data.csv", function(data) {
    // Create chart
    console.log(data);
    createChart(data);
  });

  function createChart(chartData){
    chartData.forEach(function(d) {
      d.id = +d.id;
      d.healthcare = +d.healthcare;
      d.poverty = +d.poverty;
    });
    console.log(chartData[0]);

    // initalize default label to be used to compare data
    currentXlabel = "poverty";
    currentYlabel = "healthcare";

    // set x/y minimums and maximums
    var xmin;
    var xmax;
    var ymin;
    var ymax;

    // create function to setup toolTip rules
    toolTip = d3.tip()
      .attr("class","d3-tip")
      .offset([40, -60])
      .html(function(d) {
        // x key
        var xkey;
        // Grab the state name.
        var statekey = "<div>" + d.state + "</div>";
        // Snatch the y value's key and value.
        var ykey = "<div>" + currentYlabel + ": " + d[currentYlabel] + "%</div>";
        // If the x key is poverty
        if (currentXlabel === "poverty") {
          // Grab the x key and a version of the value formatted to show percentage
          xkey = "<div>" + currentXlabel + ": " + d[currentXlabel] + "%</div>";
        }
        else {
          // Otherwise
          // Grab the x key and a version of the value formatted to include commas after every third digit.
          xkey = "<div>" +
            currentXlabel +
            ": " +
            parseFloat(d[currentXlabel]).toLocaleString("en") +
            "</div>";
        }
        // Display what we capture.
        return statekey + xkey + ykey;
      });

    // Call the toolTip function.
    chart.call(toolTip);

    function xMinMax() {
      // min will grab the smallest datum from the selected column.
      xMin = d3.min(chartData, function(d) {
        return parseFloat(d[currentXlabel]) * 0.90;
      });

      // .max will grab the largest datum from the selected column.
      xMax = d3.max(chartData, function(d) {
          return parseFloat(d[currentXlabel]) * 1.10;
        });
    }

    function yMinMax() {
    // min will grab the smallest datum from the selected column.
    yMin = d3.min(chartData, function(d) {
      return parseFloat(d[currentYlabel]) * 0.90;
    });

    // .max will grab the largest datum from the selected column.
    yMax = d3.max(chartData, function(d) {
      return parseFloat(d[currentYlabel]) * 1.10;
    });
  }

  // c. change the classes (and appearance) of label text when clicked.
  function labelChange(axis, clickedText) {
    // Switch the currently active to inactive.
    d3
      .selectAll(".label")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    // Switch the text just clicked to active.
    clickedText
         .classed("inactive", false)
         .classed("active", true);
  }

  // Part 3: Instantiate the Scatter Plot
  // ====================================
  // This will add the first placement of our data and axes to the scatter plot.

  // First grab the min and max values of x and y.
  xMinMax();
  yMinMax();
    
    // setup x axis
    var xValue = function(d) { 
      return d.poverty;
    }; // data -> value

    var xScale = d3
      .scaleLinear()
      .range([0, chart_width * .9]); // value -> display
        
    var xMap = function(d) {
      return xScale(xValue(d) * .9);
    }; // data -> display

    // Create x axis function
    var bottomAxis = d3.axisBottom(xScale);

    // setup y axis
    var yValue = function(d) {
       return d.healthcare;
    }; // data -> value
        
    var yScale = d3.scaleLinear()
      .range([chart_height, 0]); // value -> display
        
    var yMap = function(d) {
      return yScale(yValue(d));
    }; // data -> display
        
    // Create y axis functions
    var leftAxis = d3.axisLeft(yScale);

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(chartData, xValue)-2, d3.max(chartData, xValue)]);
    yScale.domain([d3.min(chartData, yValue)-1, d3.max(chartData, yValue)+1]);

    // x-axis
    chart.append("g")
        .classed("x axis", true)
        .attr("transform", "translate(0," + chart_height + ")")
        .call(bottomAxis);    
    
    // y-axis
    chart.append("g")
        .classed("y axis", true)
        .call(leftAxis)    

    // draw dots
    // enter
    var dots = chart.selectAll(".dot")
        .data(chartData)
        .enter()

    // update
    dots.append("circle")
      .classed("dot", true)
      .attr("r", 10)
      .attr("cx", xMap)
      .attr("cy", yMap) 
      .style("fill", "#92b1e5")
      .on("click", function(d) {
         toolTip.show(d);
         // d3.select("this").style("stroke", "#ffffff");         
      })
      .on("mouseout", function(d) {
          toolTip.hide(d);

          // Remove highlight
          // d3.select(this).style("stroke", "#e3e3e3");
      });

    dots.append("text")     
      .attr("x", xMap)
      .attr("y", yMap)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')  
      .style("font-size", "12px")
      .attr('fill', 'white')
      .text(function(d) {
         return d.abbr;
      });
      // }
  };  

}
