const svgWidth = 960;
const svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
  };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}
// function used for updating y-scale var upon click on axis label

function yScale(healthData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
        d3.max(healthData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
      
    return yLinearScale;
  }


// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis)
    
    return xAxis;
  }

function renderYAxes (newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis); 
    
    return yAxis
}

function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
  }

  function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
      var xlabel = "In Poverty %";
    }
    else if (chosenXAxis === "age") {
      var xlabel = "Age (Median)";
    }
    else if (chosenXAxis === "income") {
        var xlabel = "Household Income (Median)"
    }
  
    if (chosenYAxis === "obesity") {
        var ylabel = "Obesity(%)";
      }
      else if (chosenYAxis === "smokes") {
        var ylabel = "Smokers(%)";
      }
      else if (chosenYAxis === "healthcare") {
        var ylabel = "Lack of Healthcare (%)"
      }

    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([100, -100])
      .html(function(d) {
        return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }
  
  // Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function(healthData, error) {
    if (error) throw error;
  
    // parse data
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.healthcareLow = +data.healthcareLow;
        data.healthcareHigh = +data.healthcareHigh;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;

    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(healthData, chosenXAxis);
  
    // Create y scale function
    var yLinearScale = yScale(healthData, chosenYAxis);
      
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(healthData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
    //   .attr("text", d=> d.abbr)
      .attr("r", 20)
      .attr("fill", "blue")
      .attr("stroke", "white")
      .attr("opacity", "1");
  
    // Create group for  3 x- axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 30})`);
  
    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("% Poverty");
  
    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income(Median)");
  
    // Create group for  3 x- axis labels
    var ylabelsGroup = chartGroup.append("g");

    var obesityLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "obesity") // value to grab for event listener
      .classed("axis-text", true)
      .classed ("active", true)
      .text("Obesity (%)");
  
      var smokeLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 20 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "smokes") // value to grab for event listener
      .classed("axis-text", true)
      .classed ("inactive", true)
      .text("Smokes (%)");

      var healthcareLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 40 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "healthcare") // value to grab for event listener
      .classed("axis-text", true)
      .classed ("inactive", true)
      .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXaxis with value
          chosenXAxis = value;
  
          console.log(chosenXAxis);
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(healthData, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenXAxis === "percent_poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
                .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age_median") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
            .classed("inactive", true);
          }
          else if (chosenXAxis === "income_median") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
            .classed("inactive", false);
          }}
        })
    ylabelsGroup.selectAll("text")
          .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        chosenYAxis = value;

        console.log(chosenYAxis);

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(healthData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    if (chosenYAxis === "obesity_percent") {
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            smokeLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
                .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "smoke_level") {
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokeLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("active", false)
            .classed("inactive", true);
          }
          else if (chosenYAxis === "healthcare_level") {
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokeLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
      }
      }
    });
  });
