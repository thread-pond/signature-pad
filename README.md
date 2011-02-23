SignaturePad
============

SignaturePad: A jQuery plugin for assisting in the creation of an HTML5 canvas
based signature pad. Records the drawn signature in JSON for later regeneration.

Copyright MMXI, Thomas J Bradley, [hey@thomasjbradley.ca](mailto:hey@thomasjbradley.ca)

Dependencies: excanvas, json2, jquery-1.3.2+

Versioned using Semantic Versioning, [http://semver.org/](http://semver.org/)


Complete Documentation
----------------------
[http://thomasjbradley.ca/lab/signature-pad](http://thomasjbradley.ca/lab/signature-pad)

Source Code
-----------
[http://github.com/thomasjbradley/signature-pad](http://github.com/thomasjbradley/signature-pad)


Version History
---------------
**1.5.1 (Feb. 23, 2011)**

- Added an option/fixed a bug: the pen would be jagged if thicker than 4 pixels
- Fixed a bug: if the pen left the canvas it would continue to draw
- Switch to proper JSDoc
- Cleanup and removal of extraneous semi-colons

**1.5.0 (Dec. 3, 2010)**

- Added an option to disable field validation
- Cleaned up some code

**1.4.0 (Nov. 30, 2010)**

- Regenerate method now repopulates the output so signature can be appended
- Removed some extra debug code that got missed

**1.3.2 (Oct. 31, 2010)**

- Fixed a bug on iPhone created by the fix in v1.3.1:
  if signature pad was at the top iPhone may scroll upwards

**1.3.1 (Oct. 30, 2010)**

- Fixed a bug on iPad when zoomed in:
  the signature would draw in the wrong location

**1.3.0 (Aug. 29, 2010)**

- Added getSignatureImage() method that calls toDataURL() on the canvas

**1.2.2 (Aug. 29, 2010)**

- Fixed an offset bug

**1.2.1 (Jun. 7, 2010)**

- Added namespaces to all event bindings

**1.2.0 (May 28, 2010)**

- Added touch device support

**1.1.3 (May 28, 2010)**

- Fixed bug in validation if multiple signature pads were used in jQuery 1.4.2

**1.1.2 (May 26, 2010)**

- Fixed an XSS-like bug, where entering a &lt;script&gt; or an &lt;iframe&gt; element into
  the name field would cause the code to be executed
  &lt; and &gt; are now converted to entities

**1.1.1 (Jan. 26, 2010)**

- Fixed a bug in IE 8, where IE 8 would not regenerate signatures
  Required a new version of excanvas (r71 from svn trunk)
  IE6 still requires older release r3 to work

**1.1.0 (Jan. 4, 2010)**

- Added option to require and validate a drawn signature
- Added option to default to drawIt mode
- Fixed a bug where pressing validate multiple times would remove name input

**1.0.1 (Dec. 3, 2009)**

- Fixed @font-face support for Google Chrome by adding SVG fonts
- Fixed future @font-face support by adding WOFF font

**1.0.0 (Nov. 30, 2009)**

- Initial Release
