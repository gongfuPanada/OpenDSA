/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Linear Recurrences
$(document).ready(function () {
  var av_name = "LinearRecurrencesNCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av;
  var graph;
  var leftAlign = 10;
  var topAlign = 10;
  var nodeGap = 60;
  var nodeHeight = 40;
  var nodeWidth = 40;
  var labelShift = 10;
  var labelSet;
  
  av = new JSAV(av_name);
  labelSet = [];
		
  //Slide 1
  av.umsg(interpret("Slide 1"));
  av.displayInit();
  
  //Slide 2
  av.umsg(interpret("Slide 2.1"));
  av.umsg(interpret("Slide 2.2"), {"preserve": true});
  graph = av.ds.graph({"left": leftAlign, "top": topAlign, layout: "manual", directed: false});
  var n = graph.addNode("n", {"left": leftAlign, "top": topAlign});
  var nMinusOne = graph.addNode("n-1", {"left": leftAlign + nodeWidth + nodeGap, "top": topAlign});
  var oneTwo = graph.addEdge(n, nMinusOne, {"weight": "n +"});
  n.highlight();
  oneTwo.css({"stroke":"green"});
  nMinusOne.css({"background-color":"lightgreen"});
  graph.layout();
  
  
  av.step();  
  
  //Slide 3  
  av.umsg(interpret("Slide 3.1"));
  av.umsg(interpret("Slide 3.2"), {"preserve": true});
  
  var nMinusTwo = graph.addNode("n-2", {"left": leftAlign + 2*nodeGap + 2* nodeWidth, "top": topAlign});
  var twoThree = graph.addEdge(nMinusOne, nMinusTwo, {"weight": "n-1 +</b>"});
  n.unhighlight();
  nMinusOne.css({"background-color":"white"});
  nMinusOne.highlight();
  oneTwo.css({"stroke":"black"});
  twoThree.css({"stroke":"green"});
  nMinusTwo.css({"background-color":"lightgreen"});;
  
  graph.layout();
  
  
  av.step();

  //Slide 4
  av.umsg(interpret("Slide 4.1"));
  av.umsg(interpret("Slide 4.2"), {"preserve": true});
  
  var nMinusThree = graph.addNode("n-3", {"left": leftAlign + 3*nodeGap + 3* nodeWidth, "top": topAlign});
  var threeFour = graph.addEdge(nMinusTwo, nMinusThree, {"weight": "n-2 +"});
  nMinusOne.unhighlight();
  nMinusTwo.highlight();
  twoThree.css({"stroke":"black"});
  threeFour.css({"stroke":"green"});
  nMinusThree.css({"background-color":"lightgreen"});

  graph.layout();
  av.step();

  //Slide 5
  av.umsg(interpret("Slide 5.1"));
  av.umsg(interpret("Slide 5.2"), {"preserve": true});

  var nMinusFour = graph.addNode("n-4", {"left": leftAlign + 4*nodeGap + 4* nodeWidth, "top": topAlign});
  var fourFive = graph.addEdge(nMinusThree, nMinusFour, {"weight": "n-3+"});
  nMinusTwo.unhighlight();
  nMinusTwo.css({"background-color":"white"});
  nMinusThree.highlight();
  threeFour.css({"stroke":"black"});
  fourFive.css({"stroke":"green"});
  nMinusFour.css({"background-color":"lightgreen"});
  graph.layout();
  av.step();

  //Slide 6
  av.umsg(interpret("Slide 6.1"));
  av.umsg(interpret("Slide 6.2"), {"preserve": true});
  
  var last = graph.addNode("1", {"left": leftAlign + 6 * nodeGap + 6 * nodeWidth, "top": topAlign});
  graph.layout();

  var lastEdge = av.g.line(leftAlign + 4 * nodeGap + 5.3 * nodeWidth, 
    topAlign + nodeHeight + 6, 
    leftAlign + 5 * nodeGap + 5.25 * nodeWidth + 90, 
    topAlign +  nodeHeight + 6);
  lastEdge.addClass("dashed");

  nMinusThree.unhighlight();
  nMinusThree.css({"background-color":"white"});
  fourFive.css({"stroke":"black"});
  
  nMinusFour.css({"background-color":"white"});
  last.css({"background-color":"lightgreen"});
  
  
  av.step();	

  //Slide 7
  av.umsg(interpret("Slide 7"));
  labelSet.push
  (av.label("|--------------------------------------------------------- $\\displaystyle\\sum_{i=1}^{n}i$ ---------------------------------------------------------|", {"top": topAlign + 2*nodeHeight , "left": leftAlign + 0.5 * nodeWidth}));
  av.step();

  //Slide 8
  av.umsg(interpret("Slide 8"));
  av.step();
	
  av.recorded();

});