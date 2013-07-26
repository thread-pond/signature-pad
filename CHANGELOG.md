# Changelog

**2.4.1 (Jul. 26, 2013)**

- Fixed a bug where onDrawEnd was firing too often and at incorrect times, [Issue #84](https://github.com/thomasjbradley/signature-pad/issues/84)

**2.4.0 (Jul. 16, 2013)**

- Added Grunt.js as the build tool
- Added an `onDraw` callback; [Pull Request #60](https://github.com/thomasjbradley/signature-pad/pull/60)
- Added an `onDrawEnd` callback; [Pull Request #70](https://github.com/thomasjbradley/signature-pad/pull/70)
- Added a new full window example; [Pull Request #49](https://github.com/thomasjbradley/signature-pad/pull/49)
- Updated the examples to be more modern; [Pull Request #49](https://github.com/thomasjbradley/signature-pad/pull/49)
- Improved the signature handling when leaving the `<canvas>`; [Issue #38](https://github.com/thomasjbradley/signature-pad/issues/38)
- Fixed some event and touch related bugs for: IE/10 with [Pull Request #49](https://github.com/thomasjbradley/signature-pad/pull/49); Android/4 with [Issue #78](https://github.com/thomasjbradley/signature-pad/issues/78); more browsers with [Issue #38](https://github.com/thomasjbradley/signature-pad/issues/38)
- Fixed the typed signature scaling bug [Issue #54](https://github.com/thomasjbradley/signature-pad/issues/54)
- Fixed up the .jshintrc file

**2.3.0 (Jun. 12, 2012)**

- Added the ability to get the API by re-executing signature pad on the element; [Issue #23](https://github.com/thomasjbradley/signature-pad/issues/23) and many more
- Added a function to allow updating of options later on
- Performance fix: if options.output is falsey the JSON will not be calculated; [Issue #15](https://github.com/thomasjbradley/signature-pad/issues/15)
- Removes focus from input on initialization to close any open keyboards
- Fixed [Issue #25](https://github.com/thomasjbradley/signature-pad/issues/25)
- Opened up the `validateForm()` function to allow for inclusion in other form validation code

**2.2.0 (Feb. 26, 2012)**

- Updated the custom cursor to be more browser compatible. Doesn’t work in IE < 8 because FlashCanvas overwrites the cursor. Thanks to: <http://www.useragentman.com/blog/2011/12/21/cross-browser-css-cursor-images-in-depth/>
- Updated CSS: fixed some glaring vendor prefix bugs, neutralized the colours, and updated the fonts

**2.1.2 (Feb. 21, 2012)**

- Bug fix: added `clearRect()` code to allow transparent backgrounds on the canvas—[Issue #18](https://github.com/thomasjbradley/signature-pad/issues/18)

**2.1.1 (Sep. 30, 2011)**

- Removed some extra, un-needed arguments from the `onBeforeValidate` and `onFormError` callbacks

**2.1.0 (Sep. 29, 2011)**

- Added Firefox Mobile support
- Added callbacks for validation: `onBeforeValidate`, `onFormError`—[Issue #7](https://github.com/thomasjbradley/signature-pad/issues/7)
- Changed `getSignatureImage()` to use a shadow canvas and render the signature without the line
- Cleaned up event creation and removal
- Fixed a bug with Playbook and other non-iOS Webkit browsers; caused by a bug fix for iOS browsers—[Issue #8](https://github.com/thomasjbradley/signature-pad/issues/8)
- Can now pass arguments to `getSignatureImage()`, which will be forwarded to `toDataURL()`—[Issue #9](https://github.com/thomasjbradley/signature-pad/issues/9)
- Fixed [Issue #10](https://github.com/thomasjbradley/signature-pad/issues/10)

**2.0.4 (May 12, 2011)**

- Fixed a bug with `defaultAction: drawIt`: the `.typeItDesc` was initially being displayed when it shouldn’t

**2.0.3 (May 10, 2011)**

- Fixed a bug with `bgColour`: the colour was not being honoured when clearing the canvas

**2.0.2 (Apr. 7, 2011)**

- Added an unintentional missing feature: when clicking on the pad, a dot is now drawn

**2.0.1 (Apr. 7, 2011)**

- Fixed a bug in `regenerate()` related to the `penCap`

**2.0.0 (Feb. 25, 2011)**

- Switched to FlashCanvas instead of ExplorerCanvas (more reliable, less hacks needed, actively being developed)
- `.getSignatureImage()` now works cross-browser thanks to FlashCanvas
- Fixed [Issue #2](https://github.com/thomasjbradley/signature-pad/issues/2)

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

- Fixed a bug on iPhone created by the fix in v1.3.1: if signature pad was at the top iPhone may scroll upwards

**1.3.1 (Oct. 30, 2010)**

- Fixed a bug on iPad when zoomed in: the signature would draw in the wrong location

**1.3.0 (Aug. 29, 2010)**

- Added `getSignatureImage()` method that calls `toDataURL()` on the canvas

**1.2.2 (Aug. 29, 2010)**

- Fixed an offset bug

**1.2.1 (Jun. 7, 2010)**

- Added namespaces to all event bindings

**1.2.0 (May 28, 2010)**

- Added touch device support

**1.1.3 (May 28, 2010)**

- Fixed bug in validation if multiple signature pads were used in jQuery 1.4.2

**1.1.2 (May 26, 2010)**

- Fixed an XSS-like bug, where entering a `<script>` or an `<iframe>` element into the name field would cause the code to be executed < and > are now converted to entities

**1.1.1 (Jan. 26, 2010)**

- Fixed a bug in IE 8, where IE 8 would not regenerate signatures; required a new version of ExplorerCanvas (r71 from svn trunk) IE6 still requires older release r3 to work

**1.1.0 (Jan. 4, 2010)**

- Added option to require and validate a drawn signature
- Added option to default to drawIt mode
- Fixed a bug where pressing validate multiple times would remove name input

**1.0.1 (Dec. 3, 2009)**

- Fixed `@font-face` support for Google Chrome by adding SVG fonts
- Fixed future `@font-face` support by adding WOFF font

**1.0.0 (Nov. 30, 2009)**

- Initial Release
