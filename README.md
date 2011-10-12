# Signature Pad
SignaturePad: A jQuery plugin for assisting in the creation of an HTML5 canvas based signature pad. Records the drawn signature in JSON for later regeneration.

Copyright MMXI, Thomas J Bradley, <hey@thomasjbradley.ca>

Dependencies: FlashCanvas/1.5, json2, jquery/1.3.2+

Versioned using Semantic Versioning, <http://semver.org/>

## Quick Start
1. Include `jquery.signaturepad.css`, `flashcanvas.js`, `jquery.js`, `jquery.signaturepad.js`, `json2.js` in your HTML file
2. Create the HTML, following the example: <https://github.com/thomasjbradley/signature-pad/blob/master/examples/accept-signature.html>
3. `$('.sigPad').signaturePad();`
4. Remember that [most things are configurable](http://thomasjbradley.ca/lab/signature-pad#options)

### Complete Documentation
<http://thomasjbradley.ca/lab/signature-pad>

## Examples
- [Accepting a Signature](https://github.com/thomasjbradley/signature-pad/blob/master/examples/accept-signature.html)
- [Requiring a Drawn Signature](https://github.com/thomasjbradley/signature-pad/blob/master/examples/require-drawn-signature.html)
- [Regenerating a Signature](https://github.com/thomasjbradley/signature-pad/blob/master/examples/regenerate-signature.html)
- [Accepting Multiple Signatures](https://github.com/thomasjbradley/signature-pad/blob/master/examples/accept-multiple-signatures.html)

## Demos
- [Accepting a Signature](http://thomasjbradley.ca/lab/signature-pad-accept)
- [Requiring a Drawn Signature](http://thomasjbradley.ca/lab/signature-pad-require-drawn)
- [Regenerating a Signature](http://thomasjbradley.ca/lab/signature-pad-regenerate)

## Converting to an Image

### Client Side
The API includes a method called signatureToImage() which will return a Base64 encoded PNG to Javascript.

*Unfortunately, the function doesn’t work in all browsers, only because the underlying `toDataURL()` method of `<canvas>` isn’t implemented well. The primary culprit of poor implementation is Android OS < 3. The function does work in IE thanks to FlashCanvas.*

### Server Side
- [Signature to Image](http://thomasjbradley.ca/lab/signature-to-image)—PHP to JPEG, PNG or GIF by Thomas J Bradley
- [sigToSvg](https://github.com/chaz-meister/sigToSvg/)—PHP to SVG by Charles Gebhard
- [python-signpad2image](https://github.com/videntity/python-signpad2image)—Python to PNG by Alan Viars
- [SignatureToDotNet](https://github.com/parrots/SignatureToImageDotNet)—C# to JPEG, PNG or GIF by Curtis Herbert
- [sigJsonToImage](http://www.cflib.org/udf/sigJsonToImage)—ColdFusion to PNG by James Moberg

## Source Code
<http://github.com/thomasjbradley/signature-pad>

## License
Signature Pad is licensed under the [New BSD license](https://github.com/thomasjbradley/signature-pad/blob/master/NEW-BSD-LICENSE.txt).

All dependencies: jQuery, JSON 2, and FlashCanvas retain their own licenses.
