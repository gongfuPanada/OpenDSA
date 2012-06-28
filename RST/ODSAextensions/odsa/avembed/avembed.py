# Copyright (C) 2012 Eric Fouh 
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the MIT License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
#

__author__ = 'efouh'

from docutils import nodes
from docutils.parsers.rst import directives
from docutils.parsers.rst import Directive
import random


def setup(app):
    app.add_directive('avembed',avembed)


CODE = """\
<div id="start">
<center>
   <p></p>
   <div id="embedHere"></div>
   <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
   <script>$(function() { $.getJSON("http://algoviz.org/oembed/?url=%(address)s&callback=?"    
      , function(data) {
      $("#embedHere").html(data.html); })});
   </script>
</center>
</div>
"""

CODE1= """\
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
<script>document.getElementById("%(divID)s+show").style.display ="none"; document.getElementById("%(divID)s").style.display ="block";</script>
"""



SHOW = """\
<input type="button" 
    name="%(address)s" 
    value="Show %(title)s" 
    id="%(divID)s+show"
    class="showLink" 
    style="background-color:#f00;"/>
<div id="%(divID)s" 
    class="more">
"""


HIDE = """\
<input type="button"
    name="%(address)s+hide"
    value="Hide %(title)s"
    id="%(divID)s+hide"
    class="hideLink"
    style="background-color:#f00;"/>
</div><p></p>
"""



def showbutton(argument):
    """Conversion function for the "showbutton" option."""
    return directives.choice(argument, ('show', 'hide'))


class avembed(Directive):
    required_arguments = 1
    optional_arguments = 2 
    final_argument_whitespace = True
    has_content = True
    option_spec = {'showbutton':showbutton,
                   'title': directives.unchanged, 
                   }

    def run(self):
                
        """ Restructured text extension for inserting embedded AVs with show/hide button """
        self.options['address'] = self.arguments[0] 

        if 'showbutton' in self.options:
            divID = "Example%s"%random.randint(1,1000)
            self.options['divID'] = divID

            if self.options['showbutton'] == "show":
                res = SHOW % (self.options)
                res += HIDE % (self.options)
                res += CODE1 % (self.options)     
                res += CODE % (self.options)
                return [nodes.raw('', res, format='html')]
            else:
                res = SHOW % (self.options) 
                res += HIDE % (self.options)
                return [nodes.raw('', res, format='html')]

        else:
            res = CODE % self.options 
            return [nodes.raw('', res, format='html')]



source = """\
This is some text.

.. avembed:: address 
   :showbutton:
   :title: 


This is some more text.
"""

if __name__ == '__main__':
    from docutils.core import publish_parts

    directives.register_directive('avembed',avembed)

    doc_parts = publish_parts(source,
            settings_overrides={'output_encoding': 'utf8',
            'initial_header_level': 2},
            writer_name="html")

    print doc_parts['html_body']




 
