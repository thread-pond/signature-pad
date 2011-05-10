/**
 *	@preserve SignaturePad: A jQuery plugin for assisting in the creation of an HTML5 canvas
 *	based signature pad. Records the drawn signature in JSON for later regeneration.
 *
 *	Dependencies: FlashCanvas 1.5, json2, jquery-1.3.2+
 *	
 *	@project ca.thomasjbradley.applications.signaturepad
 *	@author Thomas J Bradley <hey@thomasjbradley.ca>
 *	@link http://thomasjbradley.ca/lab/signature-pad
 *	@link http://github.com/thomasjbradley/signature-pad
 *	@copyright Copyright MMXI, Thomas J Bradley
 *	@license New BSD License
 *	@version 2.0.3
 */

/**
 *	Usage for accepting signatures:
 *		$('.sigPad').signaturePad()
 *
 *	Usage for displaying previous signatures:
 *		$('.sigPad').signaturePad({displayOnly:true}).regenerate(sig)
 *		or
 *		var api = $('.sigPad').signaturePad({displayOnly:true})
 *		api.regenerate(sig)
 */
(function($){

function SignaturePad(selector, options)
{
	/**
	 *	Reference to the object for use in public methods
	 *
	 *	@private
	 *	@type {Object}
	 */
	var self = this

	/**
	 *	Holds the merged default settings and user passed settings
	 *
	 *	@private
	 *	@type {Object}
	 */
	,settings = $.extend({}, $.fn.signaturePad.defaults, options)

	/**
	 *	The current context, as passed by jQuery, of selected items
	 *
	 *	@private
	 *	@type {Object}
	 */
	,context = $(selector)

	/**
	 *	jQuery reference to the canvas element inside the signature pad
	 *
	 *	@private
	 *	@type {Object}
	 */
	,canvas = $(settings.canvas, context)

	/**
	 *	Dom reference to the canvas element inside the signature pad
	 *
	 *	@private
	 *	@type {Object}
	 */
	,element = canvas.get(0)

	/**
	 *	The drawing context for the signature canvas
	 *
	 *	@private
	 *	@type {Object}
	 */
	,canvasContext = null

	/**
	 *	Holds the previous point of drawing
	 *	Disallows drawing over the same location to make lines more delicate
	 *
	 *	@private
	 *	@type {Object}
	 */
	,previous = {'x':null, 'y':null}

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
	 *	@private
	 *	@type {Array}
	 */
	,output = []
	
	/**
	 *	Stores a timeout for when the mouse leaves the canvas
	 *	If the mouse has left the canvas for a specific amount of time
	 *	Stops drawing on the canvas
	 *
	 *	@private
	 *	@type {Object}
	 */
	,mouseLeaveTimeout = false

	/**
	 *	Removes all the mouse events from the canvas
	 *
	 *	@private
	 */
	function disableCanvas()
	{
		canvas.unbind('mousedown.signaturepad')
		canvas.unbind('mouseup.signaturepad')
		canvas.unbind('mousemove.signaturepad')
		canvas.unbind('mouseleave.signaturepad')
		$(settings.clear, context).unbind('click.signaturepad')
	}
	
	/**
	 *	Draws a line on canvas using the mouse position
	 *	Checks previous position to not draw over top of previous drawing
	 *		(makes the line really thick and poorly anti-aliased)
	 *	
	 *	@private
	 *	@param {Object} e The event object
	 *	@param {Object} o The object context registered to the event; canvas
	 *	@param {Number} diff The difference between offset for touch devices
	 *	@param {Number} newYOffset A pixel value for drawing the newY, used for drawing a single dot on click
	 */
	function drawLine(e, o, diff, newYOffset)
	{
		var offset = $(o).offset(), newX, newY
		
		clearTimeout(mouseLeaveTimeout)
		mouseLeaveTimeout = false
		
		if(typeof e.changedTouches !== 'undefined')
		{
			newX = Math.floor(e.changedTouches[0].pageX - offset.left + diff.left)
			newY = Math.floor(e.changedTouches[0].pageY - offset.top + diff.top)
		}
		else
		{
			newX = Math.floor(e.pageX - offset.left)
			newY = Math.floor(e.pageY - offset.top)
		}
		
		if(previous.x === newX && previous.y === newY)
			return true

		if(previous.x === null)
			previous.x = newX

		if(previous.y === null)
			previous.y = newY
		
		if(newYOffset)
			newY += newYOffset

		canvasContext.beginPath()
		canvasContext.moveTo(previous.x, previous.y)
		canvasContext.lineTo(newX, newY)
		canvasContext.lineCap = settings.penCap
		canvasContext.stroke()
		canvasContext.closePath()
		
		output.push({'lx': newX, 'ly': newY, 'mx': previous.x, 'my': previous.y})
		
		previous.x = newX
		previous.y = newY
	}
	
	/**
	 *	Callback registered to mouse/touch events of the canvas
	 *	Stops the drawing abilities
	 *
	 *	@private
	 *	@param {Object} e The event object
	 */
	function stopDrawing()
	{
		canvas.unbind('mousemove.signaturepad')
		
		if(typeof this.ontouchstart !== 'undefined')
		{
			canvas.each(function()
			{
				this.ontouchmove = null
			})
		}
		
		previous.x = null
		previous.y = null
		
		if(output.length > 0)
			$(settings.output, context).val(JSON.stringify(output))
	}

	/**
	 *	Draws the signature line
	 *
	 *	@private
	 */
	function drawSigLine()
	{
		canvasContext.beginPath()
		canvasContext.lineWidth = settings.lineWidth
		canvasContext.strokeStyle = settings.lineColour
		canvasContext.moveTo(settings.lineMargin, settings.lineTop)
		canvasContext.lineTo(element.width - settings.lineMargin, settings.lineTop)
		canvasContext.stroke()
		canvasContext.closePath()
	}

	/**
	 *	Clears all drawings off the canvas and redraws the signature line
	 *
	 *	@private
	 */
	function clearCanvas()
	{
		stopDrawing()
		
		canvasContext.fillStyle = settings.bgColour
		canvasContext.fillRect(0, 0, element.width, element.height)
		
		if(!settings.displayOnly)
			drawSigLine()
		
		canvasContext.lineWidth = settings.penWidth
		canvasContext.strokeStyle = settings.penColour
		
		$(settings.output, context).val('')
		output = []
	}

	/**
	 *	For touch based devices calculates the offset difference to accommodate
	 *	for zooming and scrolling
	 *	Targets iPad specifically, which returns the incorrect .offset().top|.left
	 *	for an object when zoomed in; appears to ignore scroll position
	 *
	 *	@private
	 *	@param {Object} o The object context registered to the mouse down event; canvas
	 *
	 *	@return {Object}
	 */
	function calculateTouchZoomDiff(o)
	{
		var oldScrollLeft, oldScrollTop = $(document).scrollTop(), newDiffTop = 0, oldDiffTop, newDiffLeft, oldDiffLeft
		
		if(oldScrollTop > 0)
		{
			oldDiffTop = o.offsetTop - $(o).offset().top
			$(document).scrollTop(0)
			newDiffTop = o.offsetTop - $(o).offset().top
			$(document).scrollTop(oldScrollTop)
		}
		
		oldScrollLeft = $(document).scrollLeft()
		newDiffLeft = 0
		
		if(oldScrollLeft > 0)
		{
			oldDiffLeft = o.offsetLeft - $(o).offset().left
			$(document).scrollLeft(0)
			newDiffLeft = o.offsetLeft - $(o).offset().left
			$(document).scrollLeft(oldScrollLeft)
		}
		
		return {
			'top': (oldDiffTop !== newDiffTop) ? $(document).scrollTop() : 0
			,'left': (oldDiffLeft !== newDiffLeft) ? $(document).scrollLeft() : 0
		}
	}

	/**
	 *	Callback registered to mouse/touch events of canvas
	 *	Triggers the drawLine function
	 *
	 *	@private
	 *	@param {Object} e The event object
	 *	@param {Object} o The object context registered to the event; canvas
	 */
	function startDrawing(e, o)
	{
		canvas.bind('mousemove.signaturepad', function(ev){ drawLine(ev, this) })

		if(typeof this.ontouchstart !== 'undefined')
		{
			canvas.each(function()
			{
				this.ontouchmove = function(ev)
				{
					drawLine(ev, this, calculateTouchZoomDiff(this))
				}
			})
			
			// Draws a single point on initial mouse down, for people with periods in their name
			drawLine(e, o, calculateTouchZoomDiff(o), 1)
		}
		else
		{
			// Draws a single point on initial mouse down, for people with periods in their name
			drawLine(e, o, null, 1)
		}
	}

	/**
	 *	Triggers the abilities to draw on the canvas
	 *	Sets up mouse/touch events, hides and shows descriptions and sets current classes
	 *
	 *	@private
	 */
	function drawIt()
	{
		$(settings.typed, context).hide()
		clearCanvas()
	
		canvas.bind('mousedown.signaturepad', function(e){ startDrawing(e, this) })
		canvas.bind('mouseup.signaturepad', function(e){ stopDrawing() })
		canvas.bind('mouseleave.signaturepad', function(e)
		{
			if(!mouseLeaveTimeout)
			{
				mouseLeaveTimeout = setTimeout(function()
				{
					stopDrawing()
					clearTimeout(mouseLeaveTimeout)
					mouseLeaveTimeout = false
				}, 200)
			}
		})
		
		if(typeof this.ontouchstart !== 'undefined')
		{
			canvas.each(function()
			{
				this.ontouchstart = function(e)
				{
					e.preventDefault()
					startDrawing(e, this)
				}
				
				this.ontouchend = function(e)
				{
					stopDrawing()
				}
				
				this.ontouchcancel = function(e)
				{
					stopDrawing()
				}
			})
		}
		
		$(settings.clear, context).bind('click.signaturepad', function(e){ clearCanvas(); return false })
		
		$(settings.typeIt, context).bind('click.signaturepad', function(e){ typeIt(); return false })
		$(settings.drawIt, context).unbind('click.signaturepad')
		$(settings.drawIt, context).bind('click.signaturepad', function(e){ return false })
		
		$(settings.typeIt, context).removeClass(settings.currentClass)
		$(settings.drawIt, context).addClass(settings.currentClass)
		$(settings.sig, context).addClass(settings.currentClass)
		
		$(settings.typeItDesc, context).hide()
		$(settings.drawItDesc, context).show()
		$(settings.clear, context).show()
	}

	/**
	 *	Triggers the abilities to type in the input for generating a signature
	 *	Sets up mouse events, hides and shows descriptions and sets current classes
	 *
	 *	@private
	 */
	function typeIt()
	{
		clearCanvas()
		disableCanvas()
		$(settings.typed, context).show()
		
		$(settings.drawIt, context).bind('click.signaturepad', function(e){ drawIt(); return false })
		$(settings.typeIt, context).unbind('click.signaturepad')
		$(settings.typeIt, context).bind('click.signaturepad', function(e){ return false })
		
		$(settings.output, context).val('')
		
		$(settings.drawIt, context).removeClass(settings.currentClass)
		$(settings.typeIt, context).addClass(settings.currentClass)
		$(settings.sig, context).removeClass(settings.currentClass)
		
		$(settings.drawItDesc, context).hide()
		$(settings.clear, context).hide()
		$(settings.typeItDesc, context).show()
	}

	/**
	 *	Callback registered on key up and blur events for input field
	 *	Writes the text fields value as Html into an element
	 *
	 *	@private
	 *	@param {String} val The value of the input field
	 */
	function type(val)
	{
		$(settings.typed, context).html(val.replace(/>/g, '&gt;').replace(/</g, '&lt;'))
		
		while($(settings.typed, context).width() > element.width)
		{
			var oldSize = $(settings.typed, context).css('font-size').replace(/px/, '')
			$(settings.typed, context).css('font-size', oldSize-1+'px')
		}
	}

	/**
	 *	Validates the form to confirm a name was typed in the field
	 *	If drawOnly also confirms that the user drew a signature
	 *
	 *	@private
	 *
	 *	@return {Boolean}
	 */
	function validateForm()
	{
		var valid = true
		
		$('p.'+settings.errorClass, context).remove()
		context.removeClass(settings.errorClass)
		$('input, label', context).removeClass(settings.errorClass)
		
		if(settings.drawOnly && output.length < 1)
		{
			$(selector).prepend('<p class="'+settings.errorClass+'">'+settings.errorMessageDraw+'</p>')
			valid = false
		}
		
		if($(settings.name, context).val() === '')
		{
			$(selector).prepend('<p class="'+settings.errorClass+'">'+settings.errorMessage+'</p>')
			$(settings.name, context).focus()
			$(settings.name, context).addClass(settings.errorClass)
			$('label[for='+$(settings.name).attr('id')+']', context).addClass(settings.errorClass)
			valid = false
		}
		
		return valid
	}

	/**
	 * Initialisation function, called immediately after all declarations
	 * Technically public, but only should be used internally
	 *
	 * @private
	 */
	function init()
	{
		// Disable selection on the typed div and canvas
		$(settings.typed, context).bind('selectstart.signaturepad', function(e){ return $(e.target).is(':input') })
		canvas.bind('selectstart.signaturepad', function(e){ return $(e.target).is(':input') })
		
		if(!element.getContext && FlashCanvas)
			FlashCanvas.initElement(element)
		
		if(element.getContext)
		{
			canvasContext = element.getContext('2d')
			
			$(settings.sig, context).show()
			
			if(!settings.displayOnly)
			{
				if(!settings.drawOnly)
				{
					$(settings.name, context).bind('keyup.signaturepad', function()
					{
						type($(this).val())
					})
					
					$(settings.name, context).bind('blur.signaturepad', function()
					{
						type($(this).val())
					})
					
					$(settings.drawIt, context).bind('click.signaturepad', function(e)
					{
						drawIt()
						return false
					})
				}
				
				if(settings.drawOnly || settings.defaultAction === 'drawIt')
				{
					drawIt()
				}
				else
				{
					typeIt()
				}
				
				if(settings.validateFields)
				{
					if($(selector).is('form'))
					{
						$(selector).bind('submit.signaturepad', function(){ return validateForm() })
					}
					else
					{
						$(selector).parents('form').bind('submit.signaturepad', function(){ return validateForm() })
					}
				}
				
				$(settings.typeItDesc, context).show()
				$(settings.sigNav, context).show()
			}
		}
	}

	$.extend(self,
	{
		/**
		 * Initialises SignaturePad
		 */
		init: function()
		{
			init()
		}

		/**
		 *	Regenerates a signature on the canvas using an array of objects
		 *	Follows same format as object property
		 *	@see var object
		 *
		 *	@param {Array} paths An array of the lines and points
		 */
		,regenerate: function(paths)
		{
			self.clearCanvas()
			$(settings.typed, context).hide()
			
			if(typeof paths === 'string')
				paths = JSON.parse(paths)
			
			for(var i in paths)
			{
				if(typeof paths[i] === 'object')
				{
					canvasContext.beginPath()
					canvasContext.moveTo(paths[i].mx, paths[i].my)
					canvasContext.lineTo(paths[i].lx, paths[i].ly)
					canvasContext.lineCap = settings.penCap
					canvasContext.stroke()
					canvasContext.closePath()
					
					output.push({'lx': paths[i].lx, 'ly': paths[i].ly, 'mx': paths[i].mx, 'my': paths[i].my})
				}
			}
			
			if($(settings.output, context).length > 0)
				$(settings.output, context).val(JSON.stringify(output))
		}

		/**
		 *	Clears the canvas
		 *	Redraws the background colour and the signature line
		 */
		,clearCanvas: function()
		{
			clearCanvas()
		}

		/**
		 *	Returns the signature as a Js array
		 *
		 *	@return {Array}
		 */
		,getSignature: function()
		{
			return output
		}

		/**
		 *	Returns the signature as a Json string
		 *
		 *	@return {String}
		 */
		,getSignatureString: function()
		{
			return JSON.stringify(output)
		}

		/**
		 *	Returns the signature as an image
		 *
		 *	@return {String}
		 */
		,getSignatureImage: function()
		{
			return element.toDataURL()
		}
	})
}

/**
 *	Create the plugin
 *	Returns an Api which can be used to call specific methods
 *
 *	@param {Object} options The options array
 *
 *	@return {Object} The Api for controlling the instance
 */
$.fn.signaturePad = function(options)
{
	var api = null
	
	this.each(function()
	{
		api = new SignaturePad(this, options)
		api.init()
	})
	
	return api
}

/**
 *	Expose the defaults so they can be overwritten for multiple instances
 *
 *	@type {Object}
 */
$.fn.signaturePad.defaults = {
	defaultAction: 'typeIt' // What action should be highlighted first: typeIt or drawIt
	,displayOnly: false // Initialise canvas for signature display only; ignore buttons and inputs
	,drawOnly: false // Whether the to allow a typed signature or not
	,canvas: 'canvas' // Selector for selecting the canvas element
	,sig: '.sig' // Parts of the signature form that require Javascript (hidden by default)
	,sigNav: '.sigNav' // The TypeIt/DrawIt navigation (hidden by default)
	,bgColour: '#ffffff' // The colour fill for the background of the canvas
	,penColour: '#145394' // Colour of the drawing ink
	,penWidth: 2 // Thickness of the pen
	,penCap: 'round' // Determines how the end points of each line are drawn (values: 'butt', 'round', 'square')
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
}

}(jQuery))
