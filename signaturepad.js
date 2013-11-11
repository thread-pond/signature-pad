/*
 SignaturePad: A library for assisting in the creation of an HTML5 canvas
 based signature pad. Records the drawn signature in JSON for later regeneration.
 
 Based on the SignaturePad jQuery plugin from http://github.com/thomasjbradley/signature-pad
 Without all that jQuery nonsense
*/

(function () {

function SignaturePad (selector, options) {
  /**
   * Reference to the object for use in public methods
   *
   * @private
   *
   * @type {Object}
   */
  var self = this

  /**
   * Holds the merged default settings and user passed settings
   *
   * @private
   *
   * @type {Object}
   */
  , settings = window.signaturePadDefaultOptions

  /**
   * The current context, as passed by jQuery, of selected items
   *
   * @private
   *
   * @type {Object}
   */
  , context = selector

  /**
   * jQuery reference to the canvas element inside the signature pad
   *
   * @private
   *
   * @type {Object}
   */
  , canvas = context.getElementsByTagName('canvas')[0]

  /**
   * Dom reference to the canvas element inside the signature pad
   *
   * @private
   *
   * @type {Object}
   */
  , element = canvas

  /**
   * The drawing context for the signature canvas
   *
   * @private
   *
   * @type {Object}
   */
  , canvasContext = null

  /**
   * Holds the previous point of drawing
   * Disallows drawing over the same location to make lines more delicate
   *
   * @private
   *
   * @type {Object}
   */
  , previous = {'x': null, 'y': null, 'id': null}

  /**
   * An array holding all the points and lines to generate the signature
   * Each item is an object like:
   * {
   *   mx: moveTo x coordinate
   *   my: moveTo y coordinate
   *   lx: lineTo x coordinate
   *   lx: lineTo y coordinate
   * }
   *
   * @private
   *
   * @type {Array}
   */
  , output = []

  /**
   * Stores a timeout for when the mouse leaves the canvas
   * If the mouse has left the canvas for a specific amount of time
   * Stops drawing on the canvas
   *
   * @private
   *
   * @type {Object}
   */
  , mouseLeaveTimeout = false

  /**
   * Whether events have already been bound to the canvas or not
   *
   * @private
   *
   * @type {Boolean}
   */
  , eventsBound = false;

  for(var i in options) {
	settings[i] = options[i];
  }
  
  /** Works out the on-screen position of an element */
	function getAbsolutePosition(el) {
		var x = el.offsetLeft;
		var y = el.offsetTop;
		var offsetParent = el.offsetParent;
		
		while((el = el.parentNode) && el.scrollLeft != undefined)
		{
			x -= el.scrollLeft;
			y -= el.scrollTop;
			if (el == offsetParent)
			{
				x += el.offsetLeft;
				y += el.offsetTop;
				offsetParent = el.offsetParent;
			}
		}
		
		return {
			"x": x,
			"y": y
		}
	}

  /**
   * Draws a line on canvas using the mouse position
   * Checks previous position to not draw over top of previous drawing
   *  (makes the line really thick and poorly anti-aliased)
   *
   * @private
   *
   * @param {Object} e The event object
   * @param {Number} newYOffset A pixel value for drawing the newY, used for drawing a single dot on click
   */
  function drawLine (e, newYOffset) {
    var offset = getAbsolutePosition(e.target), newX, newY;

	e.preventDefault();
    clearTimeout(mouseLeaveTimeout);
    mouseLeaveTimeout = false;
	
	if (e.pointerId && !e.isPrimary) return;
	
	if (typeof e.targetTouches !== 'undefined') {
      newX = Math.floor(e.targetTouches[0].pageX - offset.x - window.pageXOffset);
      newY = Math.floor(e.targetTouches[0].pageY - offset.y - window.pageYOffset);
    } else {
      newX = Math.floor(e.pageX - offset.x);
      newY = Math.floor(e.pageY - offset.y);
    }

    if (previous.x === newX && previous.y === newY) {
      return true;
	}

    if (previous.x === null) {
      previous.x = newX;
	}

    if (previous.y === null) {
      previous.y = newY;
	}

    if (newYOffset) {
      newY += newYOffset;
	}
	
	if (e.intermediatePoints) {
		canvasContext.beginPath();
		canvasContext.lineCap = settings.penCap;
		canvasContext.moveTo(previous.x, previous.y);
		
		var points = e.getIntermediatePoints(canvas);
		var point = previous;
		for(var i=0; i<points.length-1; i++) {
			point = points[i];
			canvasContext.lineTo(point.x, point.y);
		}
		previous.x = point.x;
		previous.y = point.y;
		
		canvasContext.stroke();
		canvasContext.closePath();
	}

    canvasContext.beginPath();
    canvasContext.moveTo(previous.x, previous.y);
    canvasContext.lineTo(newX, newY);
    canvasContext.lineCap = settings.penCap;
    canvasContext.stroke();
    canvasContext.closePath();

    output.push({
      'lx' : newX
      , 'ly' : newY
      , 'mx' : previous.x
      , 'my' : previous.y
    });

    previous.x = newX;
    previous.y = newY;
  }

  /**
   * Callback registered to mouse/touch events of the canvas
   * Stops the drawing abilities
   *
   * @private
   *
   * @param {Object} e The event object
   */
  function stopDrawing (e) {
	if (e && e.which && e.which > 1) return;
	if (e && e.changedTouches && e.changedTouches[0].identifier != previous.id) return;
	if (e && e.pointerId && !e.isPrimary) return;
	
    canvas.removeEventListener('touchmove', drawLine);
	canvas.removeEventListener('MSPointerMove', drawLine);
    canvas.removeEventListener('mousemove', drawLine);

    previous.x = null;
    previous.y = null;
	previous.id = null;

    if (settings.output && output.length > 0) {
		document.getElementById(settings.output.replace(/^#/,'')).value = JSON.stringify(output);
	}
  }

  /**
   * Draws the signature line
   *
   * @private
   */
  function drawSigLine () {
    if (!settings.lineWidth) {
      return false;
	}

    canvasContext.beginPath();
    canvasContext.lineWidth = settings.lineWidth;
    canvasContext.strokeStyle = settings.lineColour;
    canvasContext.moveTo(settings.lineMargin, settings.lineTop);
    canvasContext.lineTo(element.width - settings.lineMargin, settings.lineTop);
    canvasContext.stroke();
    canvasContext.closePath();
  }

  /**
   * Clears all drawings off the canvas and redraws the signature line
   *
   * @private
   */
  function clearCanvas () {
    stopDrawing();

    canvasContext.clearRect(0, 0, element.width, element.height);
    canvasContext.fillStyle = settings.bgColour;
    canvasContext.fillRect(0, 0, element.width, element.height);

    if (!settings.displayOnly) {
      drawSigLine();
	}

    canvasContext.lineWidth = settings.penWidth;
    canvasContext.strokeStyle = settings.penColour;

    document.getElementById(settings.output.replace(/^#/,'')).value = '';
    output = [];
  }

  /**
   * Callback registered to mouse/touch events of canvas
   * Triggers the drawLine function
   *
   * @private
   *
   * @param {Object} e The event object
   * @param {Object} o The object context registered to the event; canvas
   */
  function startDrawing (e, o) {
	if (e.targetTouches && e.targetTouches[0] != e.changedTouches[0]) return;
  
    canvas.addEventListener('touchmove', drawLine, false);
	if (window.navigator.msPointerEnabled) {
		canvas.addEventListener('MSPointerMove', drawLine, false);
	} else {
		canvas.addEventListener('mousemove', drawLine, false);
	}
	
	if (e.targetTouches) previous.id = e.targetTouches[0].identifier;

    // Draws a single point on initial mouse down, for people with periods in their name
    drawLine(e, 1);
  }

  /**
   * Removes all the mouse events from the canvas
   *
   * @private
   */
  function disableCanvas () {
    eventsBound = false;

    canvas.removeEventListener('touchend', stopDrawing);
    canvas.removeEventListener('touchcancel', stopDrawing);
    canvas.removeEventListener('touchmove', drawLine);
    canvas.removeEventListener('touchleave', mouseOut);
    canvas.removeEventListener('touchstart', touchStart);

    canvas.removeEventListener('mousedown', mouseDown);
    window.removeEventListener('mouseup', stopDrawing);
    canvas.removeEventListener('mousemove', drawLine);
    canvas.removeEventListener('mouseout', mouseOut);

    canvas.removeEventListener('MSPointerDown', mouseDown);
    canvas.removeEventListener('MSPointerUp', stopDrawing);
    canvas.removeEventListener('MSPointerMove', drawLine);
    canvas.removeEventListener('MSPointerOut', mouseOut);
	
	if (canvas.oncontextmenu) canvas.oncontextmenu = null;
  }

  /**
   * Lazy touch event detection
   * Uses the first press on the canvas to detect either touch or mouse reliably
   * Will then bind other events as needed
   *
   * @private
   *
   * @param {Object} e The event object
   */
  function initDrawEvents (e) {
    if (eventsBound) {
      return false;
	}

    eventsBound = true;

    // Closes open keyboards to free up space
	if(document.activeElement) {
		document.activeElement.blur();
	}

    canvas.addEventListener('touchend', stopDrawing, false);
    canvas.addEventListener('touchcancel', stopDrawing, false);
    window.addEventListener('mouseup', stopDrawing, false);
    canvas.addEventListener('MSPointerUp', stopDrawing, false);
    canvas.addEventListener('MSPointerCancel', stopDrawing, false);
	
    canvas.addEventListener('MSPointerOut', mouseOut, false);
    canvas.addEventListener('mouseout', mouseOut, false);
    canvas.addEventListener('touchleave', mouseOut, false);
	
    canvas.removeEventListener('MSPointerDown', mouseDown);
    canvas.removeEventListener('mousedown', mouseDown);
    canvas.removeEventListener('touchstart', touchStart);
  }
	function mouseOut(e) {
        if (!mouseLeaveTimeout) {
          mouseLeaveTimeout = setTimeout(function () {
            stopDrawing();
            clearTimeout(mouseLeaveTimeout);
            mouseLeaveTimeout = false;
          }, 1000);
        }
		
		drawLine(e);
		
		previous.x = null;
		previous.y = null;
	}
	function mouseDown(e) {
      // Only allow left mouse clicks to trigger signature drawing
      if (e.which > 1) return false;
	  
      initDrawEvents(e);
      startDrawing(e, this);
	}
	function touchStart(e) {
		e.preventDefault();
        initDrawEvents(e);
        startDrawing(e, this);
	}
  /**
   * Triggers the abilities to draw on the canvas
   * Sets up mouse/touch events, hides and shows descriptions and sets current classes
   *
   * @private
   */
  function drawIt () {
    clearCanvas();

	canvas.addEventListener('touchstart', touchStart, true);
	if (window.navigator.msPointerEnabled) {
		canvas.addEventListener('MSPointerDown', mouseDown, true);
	} else {
		canvas.addEventListener('mousedown', mouseDown, true);
	}

  }


  /**
   * Redraws the signature on a specific canvas
   *
   * @private
   *
   * @param {Array} paths the signature JSON
   * @param {Object} context the canvas context to draw on
   * @param {Boolean} saveOutput whether to write the path to the output array or not
   */
  function drawSignature (paths, context, saveOutput) {
	for(var i in paths) {
      if (typeof paths[i] === 'object') {
        context.beginPath();
        context.moveTo(paths[i].mx, paths[i].my);
        context.lineTo(paths[i].lx, paths[i].ly);
        context.lineCap = settings.penCap;
        context.stroke();
        context.closePath();

        if (saveOutput) {
          output.push({
            'lx' : paths[i].lx
            , 'ly' : paths[i].ly
            , 'mx' : paths[i].mx
            , 'my' : paths[i].my
          });
        }
      }
    }
  }

  /**
   * Initialisation function, called immediately after all declarations
   * Technically public, but only should be used internally
   *
   * @private
   */
  function init () {

    // Disable selection on the typed div and canvas
	context.addEventListener('selectstart', function (e) { return e.target.tagName == 'INPUT'; }, true);
    canvas.addEventListener('selectstart', function (e) { return e.target.tagName == 'INPUT'; }, true);
	
	canvas.oncontextmenu = function() { return false; };

    if (!element.getContext && window.FlashCanvas) {
      FlashCanvas.initElement(element);
	}

    if (element.getContext) {
      canvasContext = element.getContext('2d');

      if (!settings.displayOnly) {
		drawIt();
      }
    }
  }

  
    /**
     * Initializes SignaturePad
     */
    self.init = function () { init(); };

    /**
     * Allows options to be updated after initialization
     *
     * @param {Object} options An object containing the options to be changed
     */
    self.updateOptions = function (options) {
      for(var i in options) {
		settings[i] = options[i];
	  }
    };

    /**
     * Regenerates a signature on the canvas using an array of objects
     * Follows same format as object property
     * @see var object
     *
     * @param {Array} paths An array of the lines and points
     */
    self.regenerate = function (paths) {
      self.clearCanvas();

      if (typeof paths === 'string') {
        paths = JSON.parse(paths);
	  }

      drawSignature(paths, canvasContext, true);

      if (settings.output) {
        document.getElementById(settings.output.replace(/^#/,'')).value = JSON.stringify(output);
	  }
    };

    /**
     * Clears the canvas
     * Redraws the background colour and the signature line
     */
    self.clearCanvas = function () { clearCanvas(); };

    /**
     * Returns the signature as a Js array
     *
     * @return {Array}
     */
    self.getSignature = function () { return output; };

    /**
     * Returns the signature as a Json string
     *
     * @return {String}
     */
    self.getSignatureString = function () { return JSON.stringify(output); };

    /**
     * Returns the signature as an image
     * Re-draws the signature in a shadow canvas to create a clean version
     *
     * @return {String}
     */
    self.getSignatureImage = function () {
      var tmpCanvas = document.createElement('canvas')
        , tmpContext = null
        , data = null;

      tmpCanvas.style.position = 'absolute';
      tmpCanvas.style.top = '-999em';
      tmpCanvas.width = element.width;
      tmpCanvas.height = element.height;
      document.body.appendChild(tmpCanvas);

      if (!tmpCanvas.getContext && window.FlashCanvas) {
        FlashCanvas.initElement(tmpCanvas);
	  }

      tmpContext = tmpCanvas.getContext('2d');

      tmpContext.fillStyle = settings.bgColour;
      tmpContext.fillRect(0, 0, element.width, element.height);
      tmpContext.lineWidth = settings.penWidth;
      tmpContext.strokeStyle = settings.penColour;

      drawSignature(output, tmpContext);
      data = tmpCanvas.toDataURL.apply(tmpCanvas, arguments);

      document.body.removeChild(tmpCanvas);
      tmpCanvas = null;

      return data;
    };
  
}

/**
 * Create the plugin
 * Returns an Api which can be used to call specific methods
 *
 * @param {Object} options The options array
 *
 * @return {Object} The Api for controlling the instance
 */
window.createSignaturePad = function (element, options) {
  var api = null;
	
	if (!element.sigPad) {
		api = new SignaturePad(element, options);
		api.init();
		element.sigPad = api;
	} else {
		api = element.sigPad;
		api.updateOptions(options);
	}

  return api;
};

/**
 * Expose the defaults so they can be overwritten for multiple instances
 *
 * @type {Object}
 */
window.signaturePadDefaultOptions = {
  displayOnly : false // Initialize canvas for signature display only; ignore buttons and inputs
  , bgColour : '#ffffff' // The colour fill for the background of the canvas; or transparent
  , penColour : '#145394' // Colour of the drawing ink
  , penWidth : 2 // Thickness of the pen
  , penCap : 'round' // Determines how the end points of each line are drawn (values: 'butt', 'round', 'square')
  , lineColour : '#ccc' // Colour of the signature line
  , lineWidth : 2 // Thickness of the signature line
  , lineMargin : 5 // Margin on right and left of signature line
  , lineTop : 35 // Distance to draw the line from the top
  , output : '.output' // The hidden input field for remembering line coordinates
};
}());
