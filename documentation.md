# Signature Pad Documentation

**A jQuery plugin for assisting in the creation of an HTML5 canvas based signature pad. Records the drawn signature in JSON for later regeneration.**

---

- [Introduction](#introduction)
- [Demos](#demos)
	- [Demo of accepting a signature](https://thomasjbradley.github.io/signature-pad/examples/accept-signature.html)
	- [Demo of requiring a drawn signature](https://thomasjbradley.github.io/signature-pad/examples/require-drawn-signature.html)
	- [Demo of regenerating a signature](https://thomasjbradley.github.io/signature-pad/examples/regenerate-signature.html)
- [Using the Plugin](#using-the-plugin)
	- [How to Use the Plugin](#how-to-use-the-plugin)
		- [Javascript](#javascript)
		- [HTML Template](#html-template)
			- [Further HTML Explanation](#further-html-explanation)
		- [Form Submission & Validation](#form-submission--validation)
	- [Require a Drawn Signature](#require-a-drawn-signature)
	- [Regenerating Signatures](#regenerating-signatures)
		- [Regenerating Javascript](#regenerating-javascript)
			- [Alternate Javascript](#alternate-javascript)
		- [Regenerating HTML Template](#regenerating-html-template)
	- [Resizing the Signature Pad](#resizing-the-signature-pad)
- [Converting to an Image](#converting-to-an-image)
	- [Client Side](#client-side)
	- [Server Side](#server-side)
- [Saving to a Database](#saving-to-a-database)
    - [PHP & MySQL Tutorial](#php--mysql-tutorial)
- [Options](#options)
	- [Changing Default Options](#changing-default-options)
	- [Options Reference](#options-reference)
- [API](#api)
	- [API Reference](#api-reference)
	- [API Limitations](#api-limitations)
- [Compressing the Output](#compressing-the-output)
- [Version History](#version-history)
- [License](#license)

---

## Introduction

The Signature Pad jQuery plugin will transform an HTML form into a signature pad. The Signature Pad has two modes: TypeIt and DrawIt. In TypeIt mode the user’s signature is automatically generated as HTML text, styled with `@font-face`, from the input field where they type their name. In DrawIt mode the user is able to draw their signature on the canvas element.

The drawn signature is written out to a hidden input field as a JSON array using `JSON.stringify()`. Since the signature is saved as JSON it can be submitted as part of the form and kept on file. Using the JSON array, the signature can then be regenerated into the canvas element for display.

*Obviously, Signature Pad has a couple extra dependencies: [Douglas Crockford’s json2.js](http://www.json.org/js.html) and [FlashCanvas 1.5](http://flashcanvas.net/). (Both scripts are included in the downloadable package.)*

Signature Pad tries to maintain a certain level of progressive enhancement, while still giving developers enough control. There is very little generated HTML. The HTML in the examples has some elements that should be hidden by default (including canvas). Signature Pad will trigger the display of certain items if the browser supports Javascript and canvas.

**Signature Pad works with both mouse and touch devices.**

Get the source code on GitHub: <https://github.com/thomasjbradley/signature-pad/>

---

## Demos

[Demo of accepting a signature](https://thomasjbradley.github.io/signature-pad/examples/accept-signature.html)—this demo showcases an HTML form and the Signature Pad ready to accept a new signature.

[Demo of requiring a drawn signature](https://thomasjbradley.github.io/signature-pad/examples/require-drawn-signature.html)—this demo showcases an HTML form where the user is required to draw their signature before submission.

[Demo of regenerating a signature](https://thomasjbradley.github.io/signature-pad/examples/regenerate-signature.html)—this demo showcases regeneration of a signature from a stored JSON array.

---

## How to Use the Plugin

First, include all the required Javascript files: `jquery.js`, `jquery.signaturepad.js`, `flashcanvas.js` and `json2.js`.

```html
<!--[if lt IE 9]><script src="flashcanvas.js"></script><![endif]-->
<script src="jquery.min.js"></script>
<script src="jquery.signaturepad.min.js"></script>
<script src="json2.min.js"></script>
```

*Don’t forget to include the flashcanvas.swf file.*

And the CSS file: `jquery.signaturepad.css`.

```html
<link rel="stylesheet" href="jquery.signaturepad.css">
```

The CSS file contains a generic display for the form and Signature Pad, which you are encouraged to change for your web site’s theme.

After including all the external resources, simply call the jQuery plugin method on the HTML form element:

```js
$('.sigPad').signaturePad(options);
```

The method accepts an options object for the Signature Pad instance. [Signature Pad Options Reference](#options-ref)

Calling the `signaturePad()` method also returns an API for the Signature Pad instance. [Signature Pad API Reference](#api-reference)

### Accepting Signatures

**[Demo of accepting a signature](https://thomasjbradley.github.io/signature-pad/examples/accept-signature.html)**

When accepting a signature, it is best to wrap the Signature Pad in a form so the signature can be submitted to the server for storage.

#### Javascript

```js
$(document).ready(function () {
  $('.sigPad').signaturePad();
});
```

That’s really all there is to it! (`.sigPad` is the class for the form element itself.) Of course there is some corresponding HTML, have a look below for the template.

#### HTML Template

```html
<form method="post" action="" class="sigPad">
  <label for="name">Print your name</label>
  <input type="text" name="name" id="name" class="name">
  <p class="typeItDesc">Review your signature</p>
  <p class="drawItDesc">Draw your signature</p>
  <ul class="sigNav">
    <li class="typeIt"><a href="#type-it" class="current">Type It</a></li>
    <li class="drawIt"><a href="#draw-it">Draw It</a></li>
    <li class="clearButton"><a href="#clear">Clear</a></li>
  </ul>
  <div class="sig sigWrapper">
    <div class="typed"></div>
    <canvas class="pad" width="198" height="55"></canvas>
    <input type="hidden" name="output" class="output">
  </div>
  <button type="submit">I accept the terms of this agreement.</button>
</form>
```

This is the HTML used on the accept demo and contains all the bits that Signature Pad looks for. *Remember, all of the class names are configurable [options](#options).*

##### Further HTML Explanation

Let’s go through it and explain in detail some of the important parts.

```html
<input type="text" name="name" id="name" class="name">
```

The value of the `.name` input element is used for creating the automatically generated signature.

```html
<p class="typeItDesc">Review your signature</p>
<p class="drawItDesc">Draw your signature</p>
```

These two paragraphs, `.typeItDesc` and `.drawItDesc` are used as descriptive labels for the canvas Signature Pad. They are hidden or shown depending on whether the user is drawing their signature or using the automatically generated one.

```html
<ul class="sigNav">
```

The `.sigNav` ul element is shown if the canvas can be drawn on (aka, `canvas.getContext()` is available). The list contains the links for switching modes.

```html
<li class="clearButton"><a href="#clear">Clear</a></li>
```

The `.clearButton` element is a button/link to allow the user to clear their signature if they mess it up. Displayed only when in DrawIt mode.

```html
<div class="sig sigWrapper">
```

The `.sig` and `.sigWrapper` div is hidden by default and wraps the canvas and generated signature together allowing overlapping positions.

```html
<div class="typed"></div>
```

The `.typed` div will have the value typed into the input field inserted into it. This is effectively the automatically generated signature. It can be styled in any fashion, but the samples use `@font-face` to make the text look semi-handwritten.

```html
<canvas class="pad" width="198" height="55"></canvas>
```

Obviously, the canvas element for allowing the user to draw their signature.

```html
<input type="hidden" name="output" class="output">
```

The `.output` hidden input field is where the JSON representation of the signature is stored for submission to a server.

#### Form Submission & Validation

Signature Pad automatically validates the name input field on form submission by checking to see if it is empty. If the field is empty the form isn’t submitted and Signature Pad prepends an error message to the top of the form. Signature Pad assigns an error class to the input and the label and also sets the focus on the name field.

Both the error message and error class are [options](#options) that can be changed. *There are also options for changing the functionality of the validation.*

### Require a Drawn Signature

**[Demo of requiring a drawn signature](https://thomasjbradley.github.io/signature-pad/examples/require-drawn-signature.html)**

The form can be set up to require the user to draw their signature as well as type their name into the field.

This example is almost identical to the above example, but since the user must draw their signature the HTML for typing their signature is not required. So **remove** the following two lines:

```html
<p class="typeItDesc">Review your signature</p>
```

and **delete**:

```html
<li class="typeIt"><a href="#type-it" class="current">Type It</a></li>
```

Then add the `drawOnly` option to the Javascript and set it to true. This option disables the typeIt actions and validates that the user has drawn their signature.

```js
$(document).ready(function () {
  $('.sigPad').signaturePad({drawOnly:true});
});
```

### Regenerating Signatures

**[Demo of regenerating a signature](https://thomasjbradley.github.io/signature-pad/examples/regenerate-signature.html)**

Regenerating signatures from a JSON representation is quite simple. Signature Pad accepts the JSON (string or native Javascript array) and simply redraws the signature onto the canvas element.

#### Javascript

```js
var sig = [{lx:20,ly:34,mx:20,my:34},{lx:21,ly:33,mx:20,my:34},…];

$(document).ready(function () {
  $('.sigPad').signaturePad({displayOnly:true}).regenerate(sig);
});
```

`sig` is a variable that contains the JSON representation of the signature. In the above example you can see what the JSON looks like—though it has been trimmed for brevity’s sake.

Also notice that an options variable is passed into the `signaturePad()` method. The `displayOnly` property tells Signature Pad not to initialize any of the standard HTML elements, mouse events or click events. [Signature Pad Options Reference](#options-ref)

After initializing the canvas, call the `regnerate()` method and pass it our JSON signature. This method simply redraws the signature onto the canvas element.

##### Alternative Javascript

```js
var api = $('.sigPad').signaturePad({displayOnly:true});
api.regenerate(sig);
```

Both snippets do exactly the same thing. The only difference is that in this example the API is stored in a variable and referred to later on.

#### HTML Template

```html
<div class="sigPad signed">
  <div class="sigWrapper">
    <div class="typed">Sir John A. Macdonald</div>
    <canvas class="pad" width="200" height="55"></canvas>
  </div>
  <p>Sir John A. Macdonald<br>July 1, 1867</p>
</div>
```

The HTML for displaying a signature is much simpler. The primary component is, of course, the canvas element. The typed `<div>` is still there, for progressive enhancement, and will show the automatically generated signature using HTML and CSS if Javascript and canvas are not available.

### Resizing the Signature Pad

There are a couple different places you have to update to change the size: the HTML and the CSS.

Change the dimensions of the `<canvas>` tag in the HTML.

```html
<form method="post" action="" class="sigPad">
  ⋮
  <canvas class="pad" width="198" height="55"></canvas>
  ⋮
</form>
```

If you are using the sample CSS, there are a couple places to change widths and heights.

```css
.sigPad {
  margin: 0;
  padding: 0;
  width: 200px; /* Change the width */
}

.sigWrapper {
  clear: both;
  height: 55px; /* Change the height */

  border: 1px solid #ccc;
}
```

---

## Converting to an Image

### Client Side

The API includes a method called `getSignatureImage()` which will return a Base64 encoded PNG to Javascript.

*Unfortunately, the function doesn’t work in all browsers, only because the underlying `toDataURL()` method of `<canvas>` isn’t implemented well. The primary culprit of poor implementation is Android OS < 3. The function does work in IE thanks to FlashCanvas.*

### Server Side

PHP to JPEG, PNG or GIF: [Signature to Image](https://github.com/thomasjbradley/signature-to-image/) is a simple PHP script that will take the JSON output and convert it to an image server-side. [Read more about Signature to Image](https://github.com/thomasjbradley/signature-to-image/).

PHP to SVG
: [sigToSvg](https://github.com/chaz-meister/sigToSvg/) by [Charles Gebhard](http://www.pointsystems.com/) is a script for converting the signature JSON to SVG using PHP. Check out the amazing [sigToSvg on GitHub](https://github.com/chaz-meister/sigToSvg/).

Python
: [python-signpad2image](https://github.com/videntity/python-signpad2image) by [Alan Viars](http://videntity.com) is a script for converting the signature JSON to PNG using Python. Check out the fantastico [python-signpad2image on GitHub](https://github.com/videntity/python-signpad2image).

Ruby on Rails
: [ruby-signaturepad-to-image.rb](https://gist.github.com/4258871) by [Phil Hofmann](https://github.com/branch14) is a chunk of code for converting signature JSON to PNG within a Ruby on Rails app. Check out the wam-bham [ruby-signaturepad-to-image.rb on Github](https://gist.github.com/4258871).

C#
: [SignatureToDotNet](https://github.com/parrots/SignatureToImageDotNet) by [Curtis Herbert](http://www.consumedbycode.com) is a script for converting the signature JSON to an image using C#. Check out the awesome [SignatureToDotNet project on GitHub](https://github.com/parrots/SignatureToImageDotNet).

Perl
: [signature-to-image.pl](http://search.cpan.org/~turnerjw/JSON-signature-to-image-1.0/signature-to-image.pl) by [Jim Turner](http://home.mesh.net/turnerjw/jim/) is a script for converting the signature JSON to a PNG using Perl. Check out the fabulous [signature-to-image.pl on CPAN](http://search.cpan.org/~turnerjw/JSON-signature-to-image-1.0/signature-to-image.pl).

ColdFusion
: [sigJsonToImage](http://www.cflib.org/udf/sigJsonToImage) by [James Moberg](http://www.ssmedia.com/) is a script for converting the signature JSON to an PNG using ColdFusion. Check out the super-duper [sigJsonToImage project on CFLib.org](http://www.cflib.org/udf/sigJsonToImage).

Java
: [SignatureToImageJava](https://github.com/vinodkiran/SignatureToImageJava) by [Vinod Kiran](https://github.com/vinodkiran) is a script for converting the signature JSON to an image using Java. Check out the rad [SignatureToImageJava project on GitHub](https://github.com/vinodkiran/SignatureToImageJava).

---

## Saving to a Database

Signature Pad outputs the signature to a hidden field named `output`, which can be captured like any other form post field.

```html
<input type="hidden" name="output" class="output">
```

In PHP, as an example, you can get the signature using:

```php
<?php
$sig = $_POST['output'];

// or the better way, using PHP filters
$sig = filter_input(INPUT_POST, 'output', FILTER_UNSAFE_RAW);
```

### PHP & MySQL Tutorial

[Check out the sample app and tutorial on saving the signature in PHP and MySQL](/articles/saving-signatures-php-mysql/).

---

## Options

Options can be passed into the method when Signature Pad is instantiated. Only options that are different from the defaults need to be included in the options variable.

```js
var options = {
  bgColour : '#000'
  , drawOnly : true
};
$('.sigPad').signaturePad(options);
```

### Changing Default Options

The default options can be changed globally for all instances of Signature Pad on the page using the jQuery plugin construct:

```js
$.fn.signaturePad.bgColour = '#000';
```

Setting default options always follows this pattern:

```js
$.fn.signaturePad.OPTION = VALUE;
```

### Options Reference

<table class="reference alternate">
  <col class="name">
  <col class="type">
  <col class="value">
  <col class="description">
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Type</th>
      <th scope="col">Default Value</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="name"><code>defaultAction</code></td>
      <td class="type"><code><i>string</i></code><p><em>typeIt</em> or <em>drawIt</em></td>
      <td class="value"><code><span class="s">typeIt</span></code></td>
      <td><p>Which action to be active on start-up. TypeIt will display the typed signature immediately; DrawIt will allow the user to draw immediately.</p></td>
    </tr>
    <tr>
      <td class="name"><code>displayOnly</code></td>
      <td class="type"><code><i>boolean</i></code></td>
      <td class="value"><code><b>false</b></code></td>
      <td><p>Initialize the canvas for signature display only;<br>Ignore buttons and inputs;<br>Don’t bind events</p></td>
    </tr>
    <tr>
      <td class="name"><code>drawOnly</code></td>
      <td class="type"><code><i>boolean</i></code></td>
      <td class="value"><code><b>false</b></code></td>
      <td><p>Initialize the signature pad without the typeIt abilities; Require the user to draw a signature</p></td>
    </tr>
    <tr>
      <td class="name"><code>canvas</code></td>
      <td class="type"><code><i>string</i></code><p>Representing a jQuery selector</p></td>
      <td class="value"><code><span class="s">canvas</span></code></td>
      <td><p>Selector for the canvas element from inside the form element</p></td>
    </tr>
    <tr>
      <td class="name"><code>sig</code></td>
      <td class="type"><code><i>string</i></code><p>Representing a jQuery selector</p></td>
      <td class="value"><code><span class="s">.sig</span></code></td>
      <td><p>Parts of the signature form that require Javascript (hidden by default)</p></td>
    </tr>
    <tr>
      <td class="name"><code>sigNav</code></td>
      <td class="type"><code><i>string</i></code><p>Representing a jQuery selector</p></td>
      <td class="value"><code><span class="s">.sigNav</span></code></td>
      <td><p>The TypeIt/DrawIt navigation (hidden by default)</p></td>
    </tr>
    <tr>
      <td class="name"><code>bgColour</code></td>
      <td class="type"><code><i>string</i></code><p>Representing a CSS colour</p></td>
      <td class="value"><code><span class="s">#fff</span></code></td>
      <td>
        <p>The colour fill for the background of the canvas</p>
        <p>Transparency:<br><code><b></b>{<b>bgColour</b> : <span class="s">'transparent'</span>}</code></p>
      </td>
    </tr>
    <tr>
      <td class="name"><code>penColour</code></td>
      <td class="type"><code><i>string</i></code><p>Representing a CSS colour</p></td>
      <td class="value"><code><span class="s">#145394</span></code></td>
      <td><p>Colour of the drawing ink</p></td>
    </tr>
    <tr>
      <td class="name"><code>penWidth</code></td>
      <td class="type"><code><i>integer</i></code></td>
      <td class="value"><code><span class="o">2</span></code></td>
      <td><p>Thickness, in pixels, of the drawing pen</p></td>
    </tr>
    <tr>
      <td class="name"><code>penCap</code></td>
      <td class="type"><code><i>string</i></code><p>butt, round, square</p></td>
      <td class="value"><code><span class="s">round</span></code></td>
      <td><p>Determines how the end points of each line are drawn</p></td>
    </tr>
    <tr>
      <td class="name"><code>lineColour</code></td>
      <td class="type"><code><i>string</i></code><p>Representing a CSS colour</p></td>
      <td class="value"><code><span class="s">#ccc</span></code></td>
      <td><p>Colour of the signature line</p></td>
    </tr>
    <tr>
      <td class="name"><code>lineWidth</code></td>
      <td class="type"><code><i>integer</i></code></td>
      <td class="value"><code><span class="o">2</span></code></td>
      <td><p>Thickness, in pixels, of the signature line</p></td>
    </tr>
    <tr>
      <td class="name"><code>lineMargin</code></td>
      <td class="type"><code><i>integer</i></code></td>
      <td class="value"><code><span class="o">2</span></code></td>
      <td><p>The margin on the left and the right of signature line</p></td>
    </tr>
    <tr>
      <td class="name"><code>lineTop</code></td>
      <td class="type"><code><i>integer</i></code></td>
      <td class="value"><code><span class="o">35</span></code></td>
      <td><p>Distance to draw the signature line from the top of the canvas</p></td>
    </tr>
    <tr>
      <td class="name"><code>name</code></td>
      <td class="type"><code><i>string</i></code><p>Representing a jQuery selector</p></td>
      <td class="value"><code><span class="s">.name</span></code></td>
      <td><p>The input field for typing a name</p></td>
    </tr>
    <tr>
      <td class="name"><code>typed</code></td>
      <td class="type"><code><i>string</i></code><p>Representing a jQuery selector</p></td>
      <td class="value"><code><span class="s">.typed</span></code></td>
      <td><p>The HTML element to display the printed name</p></td>
    </tr>
    <tr>
      <td class="name"><code>clear</code></td>
      <td class="type"><code><i>string</i></code><p>Representing a jQuery selector</p></td>
      <td class="value"><code><span class="s">.clearButton</span></code></td>
      <td><p>The button/link for clearing the canvas</p></td>
    </tr>
    <tr>
      <td class="name"><code>typeIt</code></td>
      <td class="type"><code><i>string</i></code><p>Representing a jQuery selector</p></td>
      <td class="value"><code><span class="s">.typeIt a</span></code></td>
      <td><p>The button/tab to trigger the TypeIt state for automatic signature generation (default state)</p></td>
    </tr>
    <tr>
      <td class="name"><code>drawIt</code></td>
      <td class="type"><code><i>string</i></code><p>Representing a jQuery selector</p></td>
      <td class="value"><code><span class="s">.drawIt a</span></code></td>
      <td><p>The button/tab to trigger the DrawIt state for drawing a signature on the canvas</p></td>
    </tr>
    <tr>
      <td class="name"><code>typeItDesc</code></td>
      <td class="type"><code><i>string</i></code><p>Representing a jQuery selector</p></td>
      <td class="value"><code><span class="s">.typeItDesc</span></code></td>
      <td><p>The description for TypeIt state</p></td>
    </tr>
    <tr>
      <td class="name"><code>drawItDesc</code></td>
      <td class="type"><code><i>string</i></code><p>Representing a jQuery selector</p></td>
      <td class="value"><code><span class="s">.drawItDesc</span></code></td>
      <td><p>The description for DrawIt state (hidden by default)</p></td>
    </tr>
    <tr>
      <td class="name"><code>output</code></td>
      <td class="type"><code><i>string</i></code><p>Representing a jQuery selector</p></td>
      <td class="value"><code><span class="s">.output</span></code></td>
      <td><p>The hidden input field for remembering the signature’s JSON array</p></td>
    </tr>
    <tr>
      <td class="name"><code>currentClass</code></td>
      <td class="type"><code><i>string</i></code><p>Representing a valid CSS class name</p></td>
      <td class="value"><code><span class="s">current</span></code></td>
      <td><p>The class used to mark items as being currently active. Used for the TypeIt/DrawIt tabs and the canvas wrapper element</p></td>
    </tr>
    <tr>
      <td class="name"><code>validateFields</code></td>
      <td class="type"><code><i>boolean</i></code></td>
      <td class="value"><code><b>true</b></code></td>
      <td><p>Whether the name and signature pad fields should be validated for completeness</p></td>
    </tr>
    <tr>
      <td class="name"><code>errorClass</code></td>
      <td class="type"><code><i>string</i></code><p>Representing a valid CSS class name</p></td>
      <td class="value"><code><span class="s">error</span></code></td>
      <td><p>The class applied to the new error HTML element, name input field and name input label</p></td>
    </tr>
    <tr>
      <td class="name"><code>errorMessage</code></td>
      <td class="type"><code><i>string</i></code></td>
      <td class="value"><code><span class="s">Please enter your name</span></code></td>
      <td><p>The error message displayed on invalid submission</p></td>
    </tr>
    <tr>
      <td class="name"><code>errorMessageDraw</code></td>
      <td class="type"><code><i>string</i></code></td>
      <td class="value"><code><span class="s">Please sign the document</span></code></td>
      <td><p>The error message displayed when in <code>drawOnly <span class="o">:</span> <b>true</b></code> and no signature has been drawn</p></td>
    </tr>
    <tr>
      <td class="name"><code>onBeforeValidate</code></td>
      <td class="type"><code><b>function</b> (<var>context</var>, <var>settings</var>)</code></td>
      <td class="value"><code><span class="c">(built in)</span></code></td>
      <td>
        <p>Pass a function callback to be executed before the form is validated. Can be used to clear the old validation errors.</p>
        <strong>Arguments</strong>
        <ol>
          <li><b>context</b>—a jQuery object representing the selected element to initalize the signature pad</li>
          <li><b>settings</b>—the signature pad settings object</li>
        </ol>
      </td>
    </tr>
    <tr>
      <td class="name"><code>onFormError</code></td>
      <td class="type"><code><b>function</b> (<var>errors</var>, <var>context</var>, <var>settings</var>)</code></td>
      <td class="value"><code><span class="c">(built in)</span></code></td>
      <td>
        <p>Pass a function callback to be executed when the form is invalid. Can be used to display error messages to the user.</p>
        <strong>Arguments</strong>
        <ol>
          <li>
            <b>errors</b>—an object containing the errors present:
            <pre style="margin-top:0"><code>{
  drawInvalid <span class="o">:</span> <b>true</b><span class="o">|</span><b>false</b>
  , nameInvalid <span class="o">:</span> <b>true</b><span class="o">|</span><b>false</b>
}</code></pre>
          </li>
          <li><b>context</b>—a jQuery object representing the selected element to initalize the signature pad</li>
          <li><b>settings</b>—the signature pad settings object</li>
        </ol>
      </td>
    </tr>
    <tr>
      <td class="name"><code>onDraw</code></td>
      <td class="type"><code><b>function</b></code></td>
      <td class="value"><code><b>null</b></code></td>
      <td>
        <p>Pass a function callback to be executed every time the user draws a new segment in their signature.</p>
      </td>
    </tr>
    <tr>
      <td class="name"><code>onDrawEnd</code></td>
      <td class="type"><code><b>function</b></code></td>
      <td class="value"><code><b>null</b></code></td>
      <td>
        <p>Pass a function callback to be executed whenever the user completes their drawing segment.</p>
      </td>
    </tr>
  </tbody>
</table>

---

## API

The API is returned from the instantiation of the Signature Pad and can be stored in a variable or chained.

```js
$('.sigPad').signaturePad({displayOnly:true}).regenerate(sig);
```

*API chaining after instantiation.*

```js
var api = $('.sigPad').signaturePad({displayOnly:true});
api.regenerate(sig);
```

*Storage of the API in a variable.*

You can also get the API at a later time by recalling the `signaturePad()` method.
It’s is less performant to do it this way, and much better to store the API in the initial call so you don’t have to touch the DOM again.

```js
$('.sigPad').signaturePad({bgColour:'transparent'});
// More code or in another function
var api = $('.sigPad').signaturePad();
var sig = api.getSignature();
```

*Later retrieval of the Signature Pad API.*

### API Reference

<table class="reference">
  <col class="method">
  <col class="arguments">
  <col class="return">
  <col class="description">
  <thead>
    <tr>
      <th scope="col">Method</th>
      <th scope="col">Arguments</th>
      <th scope="col">Return</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code><b>signaturePad</b>()</code></td>
      <td class="arguments">&nbsp;</td>
      <td class="return"><code><i>string</i></code></td>
      <td><p>Retrieves the current version of Signature Pad programmatically.</p></td>
    </tr>
    <tr>
      <td><code><b>regenerate</b>(<var>paths</var>)</code></td>
      <td class="arguments"><code><var>paths</var>:<i>array|string</i></code><p>An array of objects representing the movement and lines of the signature</p></td>
      <td class="return"><code><i>void</i></code></td>
      <td><p>Redraws a signature on the canvas element using an array of objects representing the movement and lines of the signature</p></td>
    </tr>
    <tr>
      <td><code><b>clearCanvas</b>()</code></td>
      <td class="arguments">&nbsp;</td>
      <td class="return"><code><i>void</i></code></td>
      <td><p>Clears all the drawn elements off the canvas and redraws the background colour and signature line</p></td>
    </tr>
    <tr>
      <td><code><b>getSignature</b>()</code></td>
      <td class="arguments">&nbsp;</td>
      <td class="return"><code><i>array</i></code><p>The signature as a native Javascript array</p></td>
      <td>
        <p>Returns the drawn signature as a native Javascript array</p>
        <p style="margin-bottom:0;">Each item in the array is an object following this format:</p>
        <p><code>{lx <span class="o">:</span> <span class="o">20</span>, ly <span class="o">:</span> <span class="o">34</span>, mx <span class="o">:</span> <span class="o">20</span>, my <span class="o">:</span> <span class="o">34</span>}</code></p>
        <dl class="alt">
          <dt>lx</dt>
          <dd>The lineTo() x coordinate</dd>
          <dt>ly</dt>
          <dd>The lineTo() y coordinate</dd>
          <dt>mx</dt>
          <dd>The moveTo() x coordinate</dd>
          <dt>my</dt>
          <dd>The moveTo() y coordinate</dd>
        </dl>
      </td>
    </tr>
    <tr>
      <td><code><b>getSignatureString</b>()</code></td>
      <td class="arguments">&nbsp;</td>
      <td class="return"><code><i>string</i></code><p>The signature as a JSON string; for saving</p></td>
      <td>
        <p>Returns the drawn signature as a Javascript string in the JSON format</p>
        <p style="margin-bottom:0;">The string follows this format:</p>
        <p><code><span class="s">[{"lx":20,"ly":34,"mx":20,"my":34},…]</span></code></p>
      </td>
    </tr>
    <tr>
      <td><code><b>getSignatureImage</b>()</code></td>
      <td class="arguments">&nbsp;</td>
      <td class="return"><code><i>string</i></code><p>The Base64 encoded PNG of the signature</p></td>
      <td>
        <p style="margin-bottom:0;">Returns a Base64 encoded PNG of the canvas</p>
        <p><a href="https://github.com/thomasjbradley/signature-to-image/">Check out Signature to Image for a server-side solution</a></p>
      </td>
    </tr>
    <tr>
      <td><code><b>updateOptions</b>(<var>options</var>)</code></td>
      <td class="arguments"><br><code><var>options</var>:<i>object</i></code><p>An object representing the options to change</p></td>
      <td class="return"><code><i>void</i></code></td>
      <td><p>Allows for some options to be updated later in code. <em>Only need to pass the options that are different from initialization.</em></p></td>
    </tr>
    <tr>
      <td><code><b>validateForm</b>()</code></td>
      <td class="arguments">&nbsp;</td>
      <td class="return"><code><i>boolean</i></code><p>Whether the form is valid or not</p></td>
      <td>
        <p>Allows you to call the form validation function whenever it’s best for you. As an example, in your own form validation code.</p>
        <p>Probably best to use with the validate fields option set to false:<br><code>$(<span class="s">'.sigPad'</span>).<b>signaturePad</b>({<br>&nbsp;&nbsp;<b>validateFields</b> : <b>false</b><br>});</code></p>
      </td>
    </tr>
  </tbody>
</table>

### API Limitations

Signature Pad is able to create multiple instances on a single page by selecting multiple items with jQuery. The limitation lies in the API return; Signature Pad will only return the API for the last selected element.

For multiple instances it’s best to initialize each individually and store the API in a variable. But you can get the API later by re-executing the `signaturePad()` method on the element.

---

## Compressing the Output

Sometimes the JSON string output gets very large. Thankfully Jake Moening wrote a fantastic compression algorithm.

Check out [Jake’s output compression algorithm Gist](https://gist.github.com/2559996)

---

## Version History

Check out the [changelog on GitHub](https://github.com/thomasjbradley/signature-pad/blob/master/CHANGELOG.md).

---

## License

Signature Pad is licensed under the <a href="https://github.com/thomasjbradley/signature-pad/blob/master/NEW-BSD-LICENSE.txt" rel="license">New BSD license</a>, which is included in the downloadable package.

All dependencies: [jQuery](http://jquery.com/), [json2.js](http://www.json.org/js.html), and [FlashCanvas](http://flashcanvas.net/) retain their own licenses.
