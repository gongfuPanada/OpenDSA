"use strict";
// JSAV extension for circular queue.
$(document).ready(function () {
  function sin(x) {
    return Math.sin(x * Math.PI / 180);
  }

  function cos(x) {
    return Math.cos(x * Math.PI / 180);
  }

  var Circular = function (jsav, cx, cy, r1, r2, size, options) {
    this.front = null;
    this.rear = null;
    this.jsav = jsav;
    this.cx = cx;
    this.cy = cy;
    this.r1 = r1;
    this.r2 = r2;
    this.step = 360 / size;
    var defaultOptions = {};
    this.options = $.extend(defaultOptions, options);
    var x1, y1, x2, y2, x3, y3, x4, y4, label,
        i = 0, theta = 0, pathString;
    this.path = [];
    this.labels = [];
    while (theta < 360) {
      x1 = cx + r1 * cos(theta);
      y1 = cy + r1 * sin(theta);
      x2 = cx + r2 * cos(theta);
      y2 = cy + r2 * sin(theta);
      theta += this.step;
      x3 = cx + r2 * cos(theta);
      y3 = cy + r2 * sin(theta);
      x4 = cx + r1 * cos(theta);
      y4 = cy + r1 * sin(theta);
      theta -= this.step;
      pathString = "M" + x2 + "," + y2;
      pathString += " A" + r2 + "," + r2 + " 1 0,1 " + x3 + "," + y3;
      pathString += " L" + x4 + "," + y4;
      pathString += " A" + r1 + "," + r1 + " 1 0,0 " + x1 + "," + y1;
      this.path[i] = this.jsav.g.path(pathString, this.options);

      label = this.jsav.label(" ");
      label.css({'position': 'absolute',
                 left: cx + (r1 + r2) / 2 * cos(theta + this.step / 2) - 20 + 'px',
                 top: cy + (r1 + r2) / 2 * sin(theta + this.step / 2) - 25 + 'px',
                 width: '40px', height: '20px', 'text-align': 'center'});
      this.labels[i] = label;
      var test = this.jsav.label(i);
      test.css({'position': 'absolute',
                 left: cx + (r1) / 100 * 78 * cos(theta + this.step / 2) - 20 + 'px',
                 top: cy + (r1) / 100 * 78 * sin(theta + this.step / 2) - 25 + 'px',
                 width: '40px', height: '20px', 'text-align': 'center'});
  
      i++;
      theta += this.step;
    }
  };

  // Return or set the value.
  // Since setting a value must be animated, we use a helper
  // method (_setvalue) to deal with the difference in return types
  Circular.prototype.value = function (index, newValue) {
    if (typeof newValue === "undefined") {
      return this.labels[index].element.html();
    } else {
      this._setvalue(index, newValue);
      return newValue;
    }
  };

  // Animate setting a value
  Circular.prototype._setvalue = JSAV.anim(function (index, newValue) {
    var oldval = this.labels[index].element.html();
    this.labels[index].element.html(newValue);
    return [index, oldval];
  });

  Circular.prototype.highlight = function (index) {
    this.path[index]._setattrs({"fill": "yellow", "opacity": "0.5"});
  };

  Circular.prototype.unhighlight = function (index) {
    this.path[index]._setattrs({"fill" : "none", "opacity" : "1.0"});
  };

  Circular.prototype.pointer = function (name, index, pos) {
    if (typeof pos === 'undefined') {
      pos = 0.5;
    }
    var degree = this.step * pos + this.step * index;
    var left = cos(degree) * ((this.r2 - this.r1) / 2 * 1.8);
    var top = sin(degree) * ((this.r2 - this.r1) / 2 * 1.8);
    var fx, fy;
    var tx = this.r2 * cos(degree) + this.cx;
    var ty = this.r2 * sin(degree) + this.cy;
    left = tx + 25 * cos(degree + this.step * pos) - 20;
    if (degree + 15 < 180) {
      top = ty + 25 * sin(degree + this.step * pos);
    } else {
      top = ty + 25 * sin(degree + this.step * pos) - 22;
    }
    var pointer = {};
    pointer.label = this.jsav.label(name, {relativeTo: this.labels[index],
                                           anchor: "center",
                                           myAnchor: "center",
                                           left: 0,
                                           top: 0});
    pointer.label.element.css({left: left, top: top});
    pointer.label.element.addClass("jsavpointer");
    //this.value(index, tx.toFixed() + "," + ty.toFixed());
    fx = pointer.label.element.position().left + 20;
    if (degree + this.step * pos < 180) {
      fy = pointer.label.element.position().top;
    } else {
      fy = pointer.label.element.position().top + pointer.label.element.outerHeight();
    }
    pointer.arrow = this.jsav.g.line(fx, fy, tx, ty,
                                {"stroke-width": 2, "arrow-end": "classic-wide-long"});
    // CAS: Stuck this in here to patch up positioning for now
    pointer.label.element.css({top: top - 15});
    return pointer;
  };

  JSAV.ext.circular = function (cx, cy, r1, r2, size, options) {
    return new Circular(this, cx, cy, r1, r2, size, $.extend({}, options));
  };
});
