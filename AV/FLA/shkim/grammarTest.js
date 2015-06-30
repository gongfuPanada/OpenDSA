(function ($) {
  var variables = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var jsav = new JSAV("av");
  var arrow = "&rarr;",
      lastRow = 8,          // index of the last visible row
      arr = new Array(20),
      m,
      parseTable,
      parseTree;

  var lambda = String.fromCharCode(955),
      epsilon = String.fromCharCode(949),
      square = String.fromCharCode(9633),
      emptystring = lambda;
  if (localStorage["grammar"]) {
    arr = _.map(localStorage['grammar'].split(','), function(x) { 
      var d = x.split("&rarr;");
      d.splice(1, 0, arrow);
      return d;
    });
    lastRow = arr.length;
    arr.push(["", arrow, ""]);
    localStorage.removeItem('grammar');
  } else {
    for (var i = 0; i < arr.length; i++) {
      arr[i] = ["", arrow, ""];
    }
    // arr[0] = ['S', arrow, 'aA'];
    // arr[1] = ['S', arrow, 'bA'];
    // arr[2] = ['S', arrow, 'aC'];
    // arr[3] = ['A', arrow, 'B'];
    // arr[4] = ['B', arrow, 'qvC'];
    // arr[5] = ['C', arrow, 'x'];
    // arr[6] = ['B', arrow, 'y'];
    // arr[7] = ['A', arrow, emptystring];

    // remove lambda productions example:
    // arr[0] = ['S', arrow, 'EBCA'];
    // arr[1] = ['A', arrow, 'aAa'];
    // arr[2] = ['A', arrow, emptystring];
    // arr[3] = ['B', arrow, 'bB'];
    // arr[4] = ['B', arrow, emptystring];
    // arr[5] = ['C', arrow, 'B'];
    // arr[6] = ['D', arrow, 'AB']; 
    // arr[7] = ['E', arrow, 'a'];

    // remove unit productions example:
    // arr[0] = ['S', arrow, 'Aa'];
    // arr[1] = ['S', arrow, 'A'];
    // arr[2] = ['A', arrow, 'C'];
    // arr[3] = ['B', arrow, 'b'];
    // arr[4] = ['C', arrow, 'B'];
    // arr[5] = ['C', arrow, 'cCc'];
    //lastRow = 6;

    // remove useless productions example:
    // arr[0] = ['S', arrow, 'AaB'];
    // arr[1] = ['S', arrow, 'Aa'];
    // arr[2] = ['S', arrow, 'dDc'];
    // arr[3] = ['A', arrow, 'AAa'];
    // arr[4] = ['A', arrow, 'a'];
    // arr[5] = ['B', arrow, 'bB'];
    // arr[6] = ['B', arrow, 'bBb']; 
    // arr[7] = ['C', arrow, 'cD'];
    // arr[8] = ['D', arrow, 'aAb'];
    // lastRow = 9;

    // chomsky example:
    arr[0] = ['S', arrow, 'ABAB'];
    arr[1] = ['A', arrow, 'Aa'];
    arr[2] = ['A', arrow, 'a'];
    arr[3] = ['B', arrow, 'bb'];
    lastRow = 4;

  }
  var init = function () {
      if (m) {
        m.clear();
      }
      var m2 = jsav.ds.matrix(arr, {style: "table"});
      for (var i = lastRow + 1; i < arr.length; i++) {
        m2._arrays[i].hide();
      }
      m2.layout();
      m2.on('click', matrixClickHandler);
      return m2;
  };
  
  var matrixClickHandler = function(index) {
    if ($('.jsavmatrix').hasClass('deleteMode') && index !== lastRow) {
      // recreates the matrix when deleting a row...
      arr.splice(index, 1);
      lastRow--;
      m = init();
      $('.jsavmatrix').addClass('deleteMode');
    } else if ($('.jsavmatrix').hasClass('editMode')) {
      this.highlight(index);
      var input1 = prompt('Left-hand side?', this.value(index, 0));
      if (input1 === null) {
        this.unhighlight(index);
        return;
      }
      var input2 = prompt('Right-hand side?', this.value(index, 2));
      if (input2 === null) {
        this.unhighlight(index);
        return;
      }
      if (input1 === "") {
        input1 = emptystring;
      }
      if (input2 === "") {
        input2 = emptystring;
      }
      this.value(index, 0, input1);
      arr[index][0] = input1;
      this.value(index, 2, input2);
      arr[index][2] = input2;
      this.unhighlight(index);
      if (index === lastRow) {
        // if array out of bounds, double the array size and recreate the matrix
        if (lastRow === arr.length - 1 || lastRow === arr.length) {
          var l = arr.length;
          for (var i = 0; i < l; i++) {
            arr.push(['', arrow, '']);
          }
          m = init();
          $('.jsavmatrix').addClass('editMode');
        } 
        m._arrays[lastRow + 1].show();
        lastRow++;
        m.layout();
      }
      //console.log(arr.length);
    }
  };
  m = init();
  $('.jsavmatrix').addClass("editMode");

  var bfParse = function() {
    var inputString = prompt('Input string', 'aqvx');
    if (inputString === null) {
      return;
    }
    if (parseTree) {
      parseTree.clear();
      jsav.clear();
      jsav = new JSAV("av");
      m = init();
    }
    if (parseTable) { parseTable.clear();}
    $(".jsavmatrix").removeClass('editMode');
    $(".jsavmatrix").removeClass('deleteMode');
    $("#mode").html('');
    $('#editbutton').hide();
    $('#deletebutton').hide();
    $('#convertRLGbutton').hide();
    $('#convertCFGbutton').hide();
    $('#transformations').hide();
    $('.jsavcontrols').show();
    $('#backbutton').show();
    $(m.element).css("margin-left", "50px");
    m._arrays[lastRow].hide();

    var productions = _.map(_.filter(arr, function(x) { return x[0]}), function(x) {return x.slice();});
    var table = {};   // maps each sentential form to the rule that produces it
    var sententials = [];
    var next;
    
    for (var i = 0; i < productions.length; i++) {
      m._arrays[i].unhighlight();
    }
    // assume the first production is the start variable
    for (var i = 0; i < productions.length; i++) {
      if (productions[i][0] === productions[0][0]) {
        sententials.push(productions[i][2]);
        table[productions[i][2]] = [i, ''];
      }
    }
    var derivers = {};  // variables that derive lambda
    var counter = 0;
    while (removeLambdaHelper(derivers, productions)) {
      counter++;
      if (counter > 500) {
        console.log(counter);
        break;
      }
    };
    derivers = Object.keys(derivers);

    counter = 0;
    while (true) {
      counter++;
      if (counter > 10000) {
        console.warn(counter);
        break;
      }
      next = sententials.pop();
      if (next === inputString) {
        break;
      }
      if (!next) { 
        break;
      }
      var c = null;
      for (var i = 0; i < next.length; i++) {
        c = next[i];
        if (variables.indexOf(c) !== -1) {
          _.each(productions, function(x, k) { 
            if (x[0] === c) {
              var r = x[2];
              if (r === emptystring) {
                r = "";
              }
              var s = replaceCharAt(next, i, r);
              // pruning
              var keep = true;
              var prefix = "";
              var suffix = "";
              for (var j = 0; j < s.length; j++) {
                if (inputString.indexOf(s[j]) === -1 && variables.indexOf(s[j]) === -1) {
                  keep = false;
                  break;
                }
                if (variables.indexOf(s[j]) !== -1) {
                  break;
                }
                prefix = prefix + s[j];
              }
              for (var j = s.length - 1; j >= 0; j--) {
                if (variables.indexOf(s[j]) !== -1) {
                  break;
                }
                suffix = s[j] + suffix;
              }
              // prune if prefix/suffix do not match the input string
              if (prefix !== inputString.substr(0, prefix.length) || 
                suffix !== inputString.substring(inputString.length - suffix.length)) {
                keep = false;
              }
              // prune if the new sentential form is already in the queue
              else if (sententials.indexOf(s) !== -1) {
                keep = false;
              }
              // prune if the number of terminals and non-lambda deriving variables is
              // greater than the length of the input string
              else if (_.filter(s, function(x) {
                  return variables.indexOf(x) === -1 || derivers.indexOf(x) === -1;
                }).length > inputString.length) {
                keep = false;
              }
              if (keep) {
                sententials.unshift(s);
              }
              if (!(s in table)) {
                table[s] = [k, next];
              }
            }
          });
        }
      }
    }
    console.log(counter);
    if (next === inputString) {
      jsav.umsg('"' + inputString + '" accepted');
      var temp = next;
      var results = [];   // derivation table
      counter = 0;
      while (table[temp]) {
        counter++;
        if (counter > 500) {
          console.warn(counter);
          break;
        }
        var rp = productions[table[temp][0]].join("");
        results.push([rp, temp]);
        temp = table[temp][1];
      }
      results.reverse();
      jsav.label('Grammar', {relativeTo: m, anchor: "center top", myAnchor: "center bottom"});
      parseTable = new jsav.ds.matrix(results, {left: "30px", relativeTo: m, anchor: "right top", myAnchor: "left top"});
      jsav.label('Derivation Table', {relativeTo: parseTable, anchor: "center top", myAnchor: "center bottom"});
      parseTree = new jsav.ds.tree({left: "30px", relativeTo: parseTable, anchor: "right top"});
      //console.log($('.jsavtree').width())
      jsav.label('Parse Tree', {left: "" + $('.jsavtree').width() / 2.0 + "px", relativeTo: parseTree, anchor: "center top", myAnchor: "left bottom"});
      temp = [parseTree.root(productions[0][0])];

      var displayOrder = [];  // order in which to display the nodes of the parse tree
      for (var i = 0; i < results.length; i++) {
        var p = results[i][0];
        var n;
        var temp2;
        var rem;
        var d = [];
        // find parent node
        for (var j = temp.length - 1; j >= 0; j--) {
          //console.log(temp[j].value());
          if (temp[j].value() === p.split(arrow)[0]) {
            temp2 = temp[j];
            rem = j;
            break;
          }
        }
        temp.splice(rem, 1);
        p = p.split(arrow)[1];
        var temp3 = [];
        // add children
        for (var j = 0; j < p.length; j++) {
          var par = temp2.child(j, p[j]).child(j)
          if (variables.indexOf(p[j]) !== -1) {
            temp3.unshift(par);
          } else {
            par.addClass('terminal');
          }
          d.push(par);
        }
        temp = temp.concat(temp3);
        displayOrder.push(d);
      }

      parseTree.layout();
      parseTree.root().hide();
      parseTree.root().show({recursive: false});
      for (var i = 0; i < results.length; i++) {
        parseTable._arrays[i].hide();
      }
      jsav.displayInit();
      for (var i = 0; i < results.length; i++) {
        jsav.step();
        for (var j = 0; j < m._arrays.length; j++) {
          m._arrays[j].unhighlight();
        }
        var val = parseTable.value(i, 1);
        m._arrays[table[val][0]].highlight();
        parseTable._arrays[i].show();
        var temp2 = displayOrder.shift();
        for (var j = 0; j < temp2.length; j++) {
          temp2[j].show({recursive: false});
        }
      }
      // jsav.step();
      // var leaves = getLeaves(parseTree.root());
      // for (var j = 0; j < m._arrays.length; j++) {
      //     m._arrays[j].unhighlight();
      //   }
      // for (var i = 0; i < leaves.length; i++) {
      //   leaves[i].highlight();
      // }
      jsav.recorded();
    } else {
      // if string is rejected, automatically return to the editor
      jsav.umsg('"' + inputString + '" rejected');
      $('button').show();
      $('#transformations').show();
      $('.jsavcontrols').hide();
      $('#backbutton').hide();
      $(m.element).css("margin-left", "auto");
      m._arrays[lastRow].show();
    }
  }; 

  var replaceCharAt = function (str, index, ch) {
    if (index < 0 || index > str.length - 1) {
      return str;
    } else {
      return str.substring(0, index) + ch + str.substring(index + 1);
    }
  };

  var getLeaves = function(node) {
    var leaves = [];
    if (node.childnodes == false) {
      return leaves.concat(node);
    } else { 
      for (var i = 0; i < node.childnodes.length; i++) {
        leaves = leaves.concat(getLeaves(node.child(i)));
      }
      return leaves;
    }
  };


  var editMode = function() {
    $('.jsavmatrix').addClass("editMode");
    $('.jsavmatrix').removeClass("deleteMode");
    $("#mode").html('Editing');
  };
  var deleteMode = function() {
    $('.jsavmatrix').addClass("deleteMode");
    $('.jsavmatrix').removeClass("editMode");
    $("#mode").html('Deleting');
  };

  //=================================
  // transformations

  // remove lambda productions
  var removeLambda = function () {
    var derivers = {};  // variables that derive lambda
    var productions = _.map(_.filter(arr, function(x) { return x[0];}), function(x) { return x.slice();});
    var counter = 0;
    // find lambda-deriving variables
    while (removeLambdaHelper(derivers, productions)) {
      counter++;
      if (counter > 500) {
        console.log(counter);
        break;
      }
    };
    if (productions[0][0] in derivers) {
      alert('The start variable derives lambda');
    }
    var transformed = [];
    productions = _.filter(productions, function(x) { return x[2] !== emptystring;});
    transformed = transformed.concat(productions);
    for (var i = 0; i < productions.length; i++) {
      var p = productions[i];
      var v = _.uniq(_.filter(p[2], function(x) { return x in derivers;}));  // remove lambda productions
      if (v.length > 0) {
        v = v.join('');
        for (var j = v.length - 1; j >= 0; j--) {
          // remove all combinations of lambda-deriving variables
          var n = getCombinations(v, j + 1);
          for (var next = n.next(); next.value; next = n.next()) {
            var regex = new RegExp('[' + next.value.join('') + ']','g');
            var replaced = p[2].replace(regex, "");
            if (replaced) {
              transformed.push([p[0], arrow, replaced]);
            }
          }
        }
      }
    }
    // for (var i = 0; i < transformed.length; i++) {
    //   console.log("" + transformed[i]);
    // }
    // arr = transformed;
    // lastRow = arr.length;
    // arr.push(["", arrow, ""]);
    // m = init();
    // $('.jsavmatrix').addClass('editMode');
    localStorage['grammar'] = _.map(transformed, function(x) {return x.join('');});
    window.open('grammarTest.html', '');
  };
  var removeLambdaHelper = function (set, productions) {
    // a variable derives lambda if it directly produces lambda or if its right side is
    // composed only of lambda-deriving variables
    // NOTE: this function is used during brute force parsing as well
    for (var i = 0; i < productions.length; i++) {
      if (productions[i][2] === emptystring || _.every(productions[i][2], function(x) { return x in set;})) {
        if (!(productions[i][0] in set)) {
          set[productions[i][0]] = true;
          return true;
        } 
      }
    }
    return false;
  };
  var getCombinations = function* (str, l) {
    // creates a generator for the combinations of variables to remove
    for (var i = 0; i < str.length; i++) {
      if (l === 1) {
        yield [str[i]];
      } else {
        var n = getCombinations(str.substring(i + 1), l - 1);
        for (var next = n.next(); next.value; next = n.next()) {
          yield [str[i]].concat(next.value);
        }
      }
    }
  };

  // remove unit productions
  var removeUnit = function () {
    var productions = _.map(_.filter(arr, function(x) { return x[0];}), function(x) { return x.slice();});
    var pDict = {};
    // a dictionary mapping left sides to right sides
    for (var i = 0; i < productions.length; i++) {
      if (!(productions[i][0] in pDict)) {
        pDict[productions[i][0]] = [];
      }
      pDict[productions[i][0]].push(productions[i][2]);
    }
    var counter = 0;
    while (removeUnitHelper(productions, pDict)) {
      counter++;
      if (counter > 500) {
        console.log(counter);
        break;
      }
    };
    // remove original unit productions
    productions = _.filter(productions, function(x) {
      return !(x[2].length === 1 && variables.indexOf(x[2]) !== -1);
    })
    // for (var i = 0; i < productions.length; i++) {
    //   console.log(""+productions[i]);
    // }
    // console.log(productions.length);
    localStorage['grammar'] = _.map(productions, function(x) {return x.join('');});
    window.open('grammarTest.html', '');
  };
  var removeUnitHelper = function (productions, pDict) {
    // finds a unit production and adds one of the replacement productions
    for (var i = 0; i < productions.length; i++) {
      if (productions[i][2].length === 1 && variables.indexOf(productions[i][2]) !== -1) {
        var p = pDict[productions[i][2]];
        var n;
        for (var j = 0; j < p.length; j++) {
          if (p[j].length === 1 && variables.indexOf(p[j]) !== -1) {
            continue;
          } else if (!_.find(productions, function(x){ return x[0] === productions[i][0] && x[2] === p[j];})) {
            n = p[j];
            break;
          }
        }
        if (n) {
          productions.push([productions[i][0], arrow, n]);
          pDict[productions[i][0]].push(n);
          return true;
        }
      }
    }
    return false;
  };

  // remove useless productions
  var removeUseless = function () {
    var derivers = {};  // variables that derive a string of terminals
    var productions = _.map(_.filter(arr, function(x) { return x[0];}), function(x) { return x.slice();});
    var counter = 0;
    while (findDerivable(derivers, productions)) {
      counter++;
      if (counter > 500) {
        console.log(counter);
        break;
      }
    };
    var transformed = [];
    // remove productions which do not derive a string of terminals
    for (var i = 0; i < productions.length; i++) {
      if (_.every(productions[i][2], function(x) { return x in derivers || variables.indexOf(x) === -1;})) {
        transformed.push(productions[i]);
      }
    }
    var pDict = {};   // dictionary to hold reachable variables
    var start = transformed[0][0];
    for (var i = 0; i < transformed.length; i++) {
      if (!(transformed[i][0] in pDict)) {
        pDict[transformed[i][0]] = [];
      }
      // map left hand side to the variables in the right hand side
      var r = _.uniq(_.filter(transformed[i][2], function(x) {return variables.indexOf(x) !== -1;}));
      pDict[transformed[i][0]] = pDict[transformed[i][0]].concat(r);
    }
    var visited = {};
    visited[start] = true;
    // find reachable variables and map them in pDict
    findReachable(start, pDict, visited);
    // remove unreachable productions
    transformed = _.filter(transformed, function(x) { return x[0] === start || pDict[start].indexOf(x[0]) !== -1;});
    // for (var i = 0; i < transformed.length; i++) {
    //   console.log(""+transformed[i]);
    // }
    // console.log(transformed.length);
    localStorage['grammar'] = _.map(transformed, function(x) {return x.join('');});
    window.open('grammarTest.html', '');
  };
  var findDerivable = function (set, productions) {
    // finds a deriver
    for (var i = 0; i < productions.length; i++) {
      if (_.every(productions[i][2], function(x) { return x in set || variables.indexOf(x) === -1;})) {
        if (!(productions[i][0] in set)) {
          set[productions[i][0]] = true;
          return true;
        }
      }
    }
    return false;
  };
  var findReachable = function (start, pDict, visited) {
    // dfs on the dictionary
    for (var i = 0; i < pDict[start].length; i++) {
      if (!(pDict[start][i] in visited)) {
        visited[pDict[start][i]] = true;
        findReachable(pDict[start][i], pDict, visited);
        pDict[start] = _.union(pDict[start], pDict[pDict[start][i]]);
      }
    }
  };

  var convertToChomsky = function () {
    var v = {};
    // find all the variables in the grammar
    var productions = _.map(_.filter(arr, function(x) { return x[0];}), function(x) { return x.slice();});
    for (var i = 0; i < productions.length; i++) {
      var x = productions[i];
      x[2] = x[2].split("");
      v[x[0]] = true;
    }
    var tempVars = [];
    var varCounter = 1;
    // replace terminals with equivalent variables where necessary
    for (var i = 0; i < productions.length; i++) {
      if (productions[i][2].length === 1 && variables.indexOf(productions[i][2][0]) === -1) {
        continue;
      } else {
        var r = productions[i][2];
        for (var j = 0; j < r.length; j++) {
          if (r[j].length === 1 && variables.indexOf(r[j]) === -1) {
            var temp = "B(" + r[j] + ")";
            if (!_.find(productions, function(x) { return x[0] === temp;})) {
              productions.push([temp, arrow, [r[j]]]);
              tempVars.push(temp);
            }
            r[j] = temp;
          }
        }
      }
    }
    // break productions down into pairs of variables
    var chomskyHelper = function () {
      for (var i = 0; i < productions.length; i++) {
        var r = productions[i][2];
        if (r.length === 1 && variables.indexOf(r[0]) === -1) {
          continue;
        } else if (r.length > 2) {
          var temp = "D(" + varCounter + ")";
          var temp2 = r.splice(1, r.length - 1, temp);
          var present = _.find(productions, function(x) { return x[0].length > 1 && x[2].join('') === temp2.join('');});
          if (present) {
            r[1] = present[0];
          } else {
            productions.push([temp, arrow, temp2]);
            tempVars.push(temp);
            varCounter++;
          }
          return true;
        }
      }
      return false;
    };
    var counter = 0;
    while (chomskyHelper()) {
      counter++;
      if (counter > 500) {
        console.log(counter);
        break;
      }
    }
    var newVariables = _.difference(variables.split(""), Object.keys(v));
    for (var i = 0; i < productions.length; i++) {
      var x = productions[i];
      x[2] = x[2].join(""); 
      //console.log(""+x);
    }
    var toExport = true;
    localStorage['grammar'] = _.map(productions, function(x) {return x.join('');});
    //console.log(productions.length);

    // translate temporary variables for export
    for (var i = 0; i < tempVars.length; i++) {
      if (i >= newVariables.length) {
        alert('Too large to export!');
        toExport = false;
        break;
      } 
      var re = tempVars[i].replace(/[\(\)]/g, "\\$&");
      var regex = new RegExp(re, 'g');
      for (var j = 0; j < productions.length; j++) {
        productions[j][0] = productions[j][0].replace(regex, newVariables[i]);
        productions[j][2] = productions[j][2].replace(regex, newVariables[i]);
      }
    }
    if (toExport) {
      localStorage['grammar'] = _.map(productions, function(x) {return x.join('');});
      window.open('grammarTest.html', '');
    } else {
      // if there are too many variables to export, instead creates a table with the temporary variables
      window.open('npdaTable.html', '', 'width = 600, height = 625, screenX = 500, screenY = 25');
    }
  };

  //=================================
  // conversions

  var checkRightLinear = function () {
    var productions = _.filter(arr, function(x) { return x[0]});
    for (var i = 0; i < productions.length; i++) {
      var r = productions[i][2];
      for (var j = 0; j < r.length; j++) {
        if (variables.indexOf(r[j]) !== -1 && j !== r.length - 1) {
          return false;
        }
      }
    }
    return true;
  };

  $('#convertRLGbutton').click(function () {
    if (!checkRightLinear()) {
      alert('The grammar is not right-linear!');
      return;
    }
    var productions=_.filter(arr, function(x) { return x[0];});
    localStorage['grammar'] = _.map(productions, function(x) {return x.join('');});
    window.open('RLGtoFA.html', '', 'width = 800, height = 750, screenX = 300, screenY = 25');
  });
  $('#convertCFGbutton').click(function () {
    var productions=_.filter(arr, function(x) { return x[0];});
    localStorage['grammar'] = _.map(productions, function(x) {return x.join('');});
    window.open('CFGtoNPDA.html', '', 'width = 800, height = 750, screenX = 300, screenY = 25');
  });
  //=================================
  $('#backbutton').click(function () {
    if (parseTree) {
      parseTree.clear();
      jsav.clear();
      jsav = new JSAV("av");
      m = init();
    }
    if (parseTable) { parseTable.clear();}
    jsav.umsg('');
    $('button').show();
    $('#transformations').show();
    $('.jsavcontrols').hide();
    $('#backbutton').hide();
    $(m.element).css("margin-left", "auto");
  });
  $('#editbutton').click(editMode);
  $('#deletebutton').click(deleteMode);
  $('#bfpbutton').click(bfParse);
  $('#lambdabutton').click(removeLambda);
  $('#unitbutton').click(removeUnit);
  $('#uselessbutton').click(removeUseless);
  $('#chomskybutton').click(convertToChomsky);
}(jQuery));