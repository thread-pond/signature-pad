#! /bin/bash

# Build script for minifying the Javascript

java -jar ~/bin/compiler.jar --js src/jquery.signaturepad.js --js_output_file assets/jquery.signaturepad.min.js

