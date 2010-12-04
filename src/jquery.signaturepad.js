/**
 *	SignaturePad: A jQuery plugin for assisting in the creation of an HTML5 canvas
 *	based signature pad. Records the drawn signature in JSON for later regeneration.
 *
 *	Dependencies: excanvas, json2, jquery-1.3.2+
 *	
 *	@project	ca.thomasjbradley.applications.signaturepad
 *	@author		Thomas J Bradley <hey@thomasjbradley.ca>
 *	@link		http://thomasjbradley.ca/lab/signature-pad
 *	@link		http://github.com/thomasjbradley/signature-pad
 *	@copyright	Copyright MMX–, Thomas J Bradley
 *	@license	New BSD License
 *	@version	1.5.0
 */

/**
 *	Usage for accepting signatures:
 *		$('.sigPad').signaturePad();
 *
 *	Usage for displaying previous signatures:
 *		$('.sigPad').signaturePad({displayOnly:true}).regenerate(sig);
 *		or
 *		var api = $('.sigPad').signaturePad({displayOnly:true});
 *		api.regenerate(sig);
 *
 *	@package	src
 */
(function($){

function SignaturePad(selector, options)
{
	/**
	 *	Reference to the object for use in public methods
	 *
	 *	@access	private
	 *	@var	object
	 */
	var self = this;

	/**
	 *	Holds the merged default settings and user passed settings
	 *
	 *	@access	private
	 *	@var	object
	 */
	var settings = $.extend({}, $.fn.signaturePad.defaults, options);

	/**
	 *	The current context, as passed by jQuery, of selected items
	 *
	 *	@access	private
	 *	@var	object
	 */
	var context = $(selector);

	/**
	 *	jQuery reference to the canvas element inside the signature pad
	 *
	 *	@access	private
	 *	@var	object
	 */
	var canvas = $(settings.canvas, context);

	/**
	 *	Dom reference to the canvas element inside the signature pad
	 *
	 *	@access	private
	 *	@var	object
	 */
	var element = canvas.get(0);

	/**
	 *	The drawing context for the signature canvas
	 *
	 *	@access	private
	 *	@var	object
	 */
	var canvasContext = null;

	/**
	 *	Holds the previous point of drawing
	 *	Disallows drawing over the same location to make lines more delicate
	 *
	 *	@access	private
	 *	@var	object
	 */
	var previous = {'x':null, 'y':null};

	/**
	 *	An array holding all the points and lines to generate the signature
	 *	Each item is an object like:
	 *	{
	 *		mx: moveTo x coordinate
	 *		my: moveTo y coordinate
	 *		lx: lineTo x coordinate
	 *		lx: lineTo y coordinate
	 *	}
	 *
	 *	@access	private
	 *	@var	array
	 */
	var output = [];

	// Disable selection on the typed div and canvas
	$(settings.typed, context).bind('selectstart.signaturepad', function(e){ return $(e.target).is(':input'); });
	canvas.bind('selectstart.signaturepad', function(e){ return $(e.target).is(':input'); });

	if(!element.getContext)
	{
		G_vmlCanvasManager.initElement(element);
	}

	if(element.getContext)
	{
		canvasContext = element.getContext('2d');
		
		$(settings.sig, context).show();
		
		if(!settings.displayOnly)
		{
			if(!settings.drawOnly)
			{
				$(settings.name, context).bind('keyup.signaturepad', function()
				{
					type($(this).val());
				});
				
				$(settings.name, context).bind('blur.signaturepad', function()
				{
					type($(this).val());
				});
				
				$(settings.drawIt, context).bind('click.signaturepad', function(e)
				{
					drawIt();
					return false;
				});
			}
			
			if(settings.drawOnly || settings.defaultAction == 'drawIt')
			{
				drawIt();
			}
			else
			{
				typeIt();
			}
			
			if($(selector).is('form'))
			{
				$(selector).bind('submit.signaturepad', function(){ return validateForm(); });
			}
			else
			{
				$(selector).parents('form').bind('submit.signaturepad', function(){ return validateForm(); });
			}
			
			$(settings.typeItDesc, context).show();
			$(settings.sigNav, context).show();
			
			// Hack for IE7 and IE8, if clearCanvas() is called instantly it doesn't draw the sig line
			setTimeout(clearCanvas, 50);
		}
		
		// Hack for IE8 standards mode
		// excanvas sets overflow:hidden on its internal Vml div; overflow:visible works in all modes
		if(canvas.children('div').length > 0)
		{
			canvas.children('div').css('overflow', 'visible');
		}
	}
	
	$.extend(self,
	{
		/**
		 *	Regenerates a signature on the canvas using an array of objects
		 *	Follows same format as object property
		 *	@see var object
		 *
		 *	@access	public
		 *	@param	array	paths	An array of the lines and points
		 *	
		 *	@return	void
		 */
		regenerate: function(paths)
		{
			self.clearCanvas();
			$(settings.typed, context).hide();
			
			if(typeof paths === 'string')
			{
				paths = JSON.parse(paths);
			}
			
			for(var i in paths)
			{
				if(typeof paths[i] === 'object')
				{
					canvasContext.beginPath();
					canvasContext.moveTo(paths[i].mx, paths[i].my);
					canvasContext.lineTo(paths[i].lx, paths[i].ly);
					canvasContext.stroke();
					
					output.push({'lx': paths[i].lx, 'ly': paths[i].ly, 'mx': paths[i].mx, 'my': paths[i].my});
				}
			}
			
			if($(settings.output, context).length > 0)
			{
				$(settings.output, context).val(JSON.stringify(output));
			}
		}

		/**
		 *	Clears the canvas
		 *	Redraws the background colour and the signature line
		 *
		 *	@access	public
		 *
		 *	@return void
		 */
		,clearCanvas: function()
		{
			clearCanvas();
		}

		/**
		 *	Returns the signature as a Js array
		 *
		 *	@access	public
		 *
		 *	@return	array
		 */
		,getSignature: function()
		{
			return output;
		}

		/**
		 *	Returns the signature as a Json string
		 *
		 *	@access	public
		 *
		 *	@return	string
		 */
		,getSignatureString: function()
		{
			return JSON.stringify(output);
		}

		/**
		 *	Returns the signature as an image
		 *	Doesn't work in IE; relies on canvas.toDataURL();
		 *
		 *	@access	public
		 *
		 *	@return	string
		 */
		,getSignatureImage: function()
		{
			return element.toDataURL();
		}
	});

	/**
	 *	Triggers the abilities to draw on the canvas
	 *	Sets up mouse/touch events, hides and shows descriptions and sets current classes
	 *
	 *	@access	private
	 *
	 *	@return	void
	 */
	function drawIt()
	{
		$(settings.typed, context).hide();
		clearCanvas();
		
		canvas.bind('mousedown.signaturepad', function(e){ startDrawing(e, this); });
		canvas.bind('mouseup.signaturepad', function(e){ stopDrawing(); });
		
		if(typeof this.ontouchstart != 'undefined')
		{
			canvas.each(function()
			{
				this.ontouchstart = function(e)
				{
					e.preventDefault();
					startDrawing(e, this);
				};
				
				this.ontouchend = function(e)
				{
					stopDrawing();
				};
				
				this.ontouchcancel = function(e)
				{
					stopDrawing();
				};
			});
		}
		
		$(settings.clear, context).bind('click.signaturepad', function(e){ clearCanvas(); return false; });
		
		$(settings.typeIt, context).bind('click.signaturepad', function(e){ typeIt(); return false; });
		$(settings.drawIt, context).unbind('click.signaturepad');
		$(settings.drawIt, context).bind('click.signaturepad', function(e){ return false; });
		
		$(settings.typeIt, context).removeClass(settings.currentClass);
		$(settings.drawIt, context).addClass(settings.currentClass);
		$(settings.sig, context).addClass(settings.currentClass);
		
		$(settings.typeItDesc, context).hide();
		$(settings.drawItDesc, context).show();
		$(settings.clear, context).show();
	}

	/**
	 *	Removes all the mouse events from the canvas
	 *
	 *	@access	private
	 *
	 *	@return	void
	 */
	function disableCanvas()
	{
		canvas.unbind('mousedown.signaturepad');	
		canvas.unbind('mouseup.signaturepad');
		canvas.unbind('mousemove.signaturepad');
		$(settings.clear, context).unbind('click.signaturepad');
	}

	/**
	 *	Triggers the abilities to type in the input for generating a signature
	 *	Sets up mouse events, hides and shows descriptions and sets current classes
	 *
	 *	@access	private
	 *
	 *	@return	void
	 */
	function typeIt()
	{
		clearCanvas();
		disableCanvas();
		$(settings.typed, context).show();
		
		$(settings.drawIt, context).bind('click.signaturepad', function(e){ drawIt(); return false; });
		$(settings.typeIt, context).unbind('click.signaturepad');
		$(settings.typeIt, context).bind('click.signaturepad', function(e){ return false; });
		
		$(settings.output, context).val('');
		
		$(settings.drawIt, context).removeClass(settings.currentClass);
		$(settings.typeIt, context).addClass(settings.currentClass);
		$(settings.sig, context).removeClass(settings.currentClass);
		
		$(settings.drawItDesc, context).hide();
		$(settings.clear, context).hide();
		$(settings.typeItDesc, context).show();
	}

	/**
	 *	Callback registered on keyup and blur events for input field
	 *	Writes the text fields value as Html into an element
	 *
	 *	@access	private
	 *	@param	string	val	The value of the input field
	 *	
	 *	@return	void
	 */
	function type(val)
	{
		$(settings.typed, context).html(val.replace(/>/g, '&gt;').replace(/</g, '&lt;'));
		
		while($(settings.typed, context).width() > element.width)
		{
			var oldSize = $(settings.typed, context).css('font-size').replace(/px/, '');
			$(settings.typed, context).css('font-size', oldSize-1+'px');
		}
	}

	/**
	 *	Callback registered to mouse/touch events of canvas
	 *	Triggers the drawLine function
	 *
	 *	@access	private
	 *	@param	object	e	The event object
	 *	@param	object	o	The object context registered to the event; canvas
	 *
	 *	@return	void
	 */
	function startDrawing(e, o)
	{
		canvas.bind('mousemove.signaturepad', function(ev){ drawLine(ev, this); });
		
		if(typeof this.ontouchstart != 'undefined')
		{
			canvas.each(function()
			{
				this.ontouchmove = function(ev)
				{
					drawLine(ev, this, calculateTouchZoomDiff(this));
				};
			});
		}
	}
	
	/**
	 *	Callback registered to mouse/touch events of the canvas
	 *	Stops the drawing abilities
	 *
	 *	@access	private
	 *	@param	object	e	The event object
	 *
	 *	@return	void
	 */
	function stopDrawing()
	{
		canvas.unbind('mousemove.signaturepad');
		
		if(typeof this.ontouchstart != 'undefined')
		{
			canvas.each(function()
			{
				this.ontouchmove = null;
			});
		}
		
		previous.x = null;
		previous.y = null;
		
		$(settings.output, context).val(JSON.stringify(output));
	}

	/**
	 *	For touch based devices calculates the offset difference to accomodate
	 *	for zooming and scrolling
	 *	Targets iPad specifically, which returns the incorrect .offset().top|.left
	 *	for an object when zoomed in; appears to ignore scroll position
	 *
	 *	@access	private
	 *	@param	object	o	The object context registered to the mousedown event; canvas
	 *
	 *	@return	object
	 */
	function calculateTouchZoomDiff(o)
	{
		var oldScrollLeft, oldScrollTop = $(document).scrollTop();
		var newDiffTop = 0, oldDiffTop, newDiffLeft, oldDiffLeft;
		
		if(oldScrollTop > 0)
		{
			oldDiffTop = o.offsetTop - $(o).offset().top;
			$(document).scrollTop(0);
			newDiffTop = o.offsetTop - $(o).offset().top;
			$(document).scrollTop(oldScrollTop);
		}
		
		oldScrollLeft = $(document).scrollLeft();
		newDiffLeft = 0;
		
		if(oldScrollLeft > 0)
		{
			oldDiffLeft = o.offsetLeft - $(o).offset().left;
			$(document).scrollLeft(0);
			newDiffLeft = o.offsetLeft - $(o).offset().left;
			$(document).scrollLeft(oldScrollLeft);
		}
		
		return {
			'top': (oldDiffTop != newDiffTop) ? $(document).scrollTop() : 0
			,'left': (oldDiffLeft != newDiffLeft) ? $(document).scrollLeft() : 0
		};
	}

	/**
	 *	Draws a line on canvas using the mouse position
	 *	Checks previous position to not draw over top of pervious drawing
	 *		(makes the line really thick and poorly anti-aliased)
	 *	
	 *	@access	private
	 *	@param	object	e	The event object
	 *	@param	object	o	The object context registered to the event; canvas
	 *	@param	int	diff	The difference between offset for touch devices
	 *
	 *	@return	void
	 */
	function drawLine(e, o, diff)
	{
		var offset = $(o).offset(), newX, newY;
		
		if(typeof e.changedTouches != 'undefined')
		{
			newX = Math.floor(e.changedTouches[0].pageX - offset.left + diff.left);
			newY = Math.floor(e.changedTouches[0].pageY - offset.top + diff.top);
		}
		else
		{
			newX = Math.floor(e.pageX - offset.left);
			newY = Math.floor(e.pageY - offset.top);
		}
		
		if(previous.x === null)
		{
			previous.x = newX;
		}

		if(previous.y === null)
		{
			previous.y = newY;
		}
		
		canvasContext.beginPath();
		canvasContext.moveTo(previous.x, previous.y);
		canvasContext.lineTo(newX, newY);
		canvasContext.stroke();
		canvasContext.closePath();
		
		output.push({'lx': newX, 'ly': newY, 'mx': previous.x, 'my': previous.y});
		
		previous.x = newX;
		previous.y = newY;
	}

	/**
	 *	Clears all drawings off the canvas and redraws the signature line
	 *
	 *	@access	private
	 *
	 *	@return	void
	 */
	function clearCanvas()
	{
		stopDrawing();
		
		canvasContext.clearRect(0, 0, element.width, element.height);
		
		// Hack for IE6; doesn't always perform properly with transparent background
		canvasContext.fillStyle = settings.bgColour;
		canvasContext.fillRect(0, 0, element.width, element.height);
		
		if(!settings.displayOnly)
		{
			drawSigLine();
		}
		
		canvasContext.lineWidth = settings.penWidth;
		canvasContext.strokeStyle = settings.penColour;
		
		$(settings.output, context).val('');
		output = [];
	}

	/**
	 *	Draws the signature line
	 *
	 *	@access	private
	 *
	 *	@return	void
	 */
	function drawSigLine()
	{
		canvasContext.beginPath();
		canvasContext.lineWidth = settings.lineWidth;
		canvasContext.strokeStyle = settings.lineColour;
		canvasContext.moveTo(settings.lineMargin, settings.lineTop);
		canvasContext.lineTo(element.width - settings.lineMargin, settings.lineTop);
		canvasContext.stroke();
		canvasContext.closePath();
	}

	/**
	 *	Validates the form to confirm a name was typed in the field
	 *	If drawOnly also confirms that the user drew a signature
	 *
	 *	@access	private
	 *
	 *	@return	bool
	 */
	function validateForm()
	{
		if(settings.validateFields === false)
		{
			return true;
		}
		
		var valid = true;
		
		$('p.'+settings.errorClass, context).remove();
		context.removeClass(settings.errorClass);
		$('input, label', context).removeClass(settings.errorClass);
		
		if(settings.drawOnly && output.length < 1)
		{
			$(selector).prepend('<p class="'+settings.errorClass+'">'+settings.errorMessageDraw+'</p>');
			valid = false;
		}
		
		if($(settings.name, context).val() === '')
		{
			$(selector).prepend('<p class="'+settings.errorClass+'">'+settings.errorMessage+'</p>');
			$(settings.name, context).focus();
			$(settings.name, context).addClass(settings.errorClass);
			$('label[for='+$(settings.name).attr('id')+']', context).addClass(settings.errorClass);
			valid = false;
		}
		
		return valid;
	}
	
}

/**
 *	Create the plugin
 *	Returns an Api which can be used to call specific methods
 *
 *	@param	object	options	The options array
 *
 *	@return	object	The Api for controlling the instance
 */
$.fn.signaturePad = function(options)
{
	var api = null;
	
	this.each(function(){
		api = new SignaturePad(this, options);
	});
	
	return api;
};

/**
 *	Expose the defaults so they can be overwritten for multiple instances
 *
 *	@var	 object
 */
$.fn.signaturePad.defaults = {
	defaultAction: 'typeIt' // What action should be highlighted first: typeIt or drawIt
	,displayOnly: false // Initialise canvas for signature display only; ignore buttons and inputs
	,drawOnly: false // Whether the to allow a typed signature or not
	,canvas: 'canvas' // Selector for selecting the canvas element
	,sig: '.sig' // Parts of the signature form that require Javascript (hidden by default)
	,sigNav: '.sigNav' // The TypeIt/DrawIt navigation (hidden by default)
	,bgColour: '#fff' // The colour fill for the background of the canvas
	,penColour: '#145394' // Colour of the drawing ink
	,penWidth: 2 // Thickness of the pen
	,lineColour: '#ccc' // Colour of the signature line
	,lineWidth: 2 // Thickness of the signature line
	,lineMargin: 5 // Margin on right and left of signature line
	,lineTop: 35 // Distance to draw the line from the top
	,name: '.name' // The input field for typing a name
	,typed: '.typed' // The Html element to accept the printed name
	,clear: '.clearButton' // Button for clearing the canvas
	,typeIt: '.typeIt a' // Button to trigger name typing actions (current by default)
	,drawIt: '.drawIt a' // Button to trigger name drawing actions
	,typeItDesc: '.typeItDesc' // The description for TypeIt actions
	,drawItDesc: '.drawItDesc' // The description for DrawIt actions (hidden by default)
	,output: '.output' // The hidden input field for remembering line coordinates
	,currentClass: 'current' // The class used to mark items as being currently active
	,validateFields: true // Whether the name, draw fields should be validated
	,errorClass: 'error' // The class applied to the new error Html element
	,errorMessage: 'Please enter your name' // The error message displayed on invalid submission
	,errorMessageDraw: 'Please sign the document' // The error message displayed when drawOnly and no signature is drawn
};

})(jQuery);
