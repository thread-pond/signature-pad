#!/usr/bin/env python

"""
  Build script for minifying the Javascript
"""

import os

os.system('java -jar ~/bin/compiler.jar --js src/jquery.signaturepad.js --js_output_file assets/jquery.signaturepad.min.js')
