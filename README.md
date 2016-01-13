##WAVI Web Application Viewer (Node.js)

Generate a class diagram for your node.js web application.

## Installation

    $ npm install wavi -g

```
## Dependencies
```
Require Graphviz installed and PATH variable set for Graphviz in your environment variable.
(ex.: C:\Program Files (x86)\Graphviz2.38\bin)

Graphviz download:  http://www.graphviz.org/Download.php
```

WAVI is intended for developers who wish to document their web application or as a reverse engineering tool to recover 
the structure of a web application.

Web applications pose unique challenges when it comes to understanding and maintaining their heterogeneous structures, which often involve complex interactions between elements from different languages. Accurate and up-to-date documentation is rarely available and this calls for the proposal of reverse engineering approaches for the recovery and representation of such structures. The proposed package presents our ongoing work on Web Application Viewer (WAVE), a tool able to reverse engineer a web application's structure.




##Usage (CLI): 

It is strongly advised to use svg format for very large website because jpg/png/pdf are limited in width and height and will most likly not work
or use ratio and the quality will be bad.

wavi --format path/to/website path/to/result/file

Example:

```
wavi --svg website/example result/example.svg

wavi --jpg website/example result/example.jpg

wavi --png website/example result/example.png

wavi --pdf website/example result/example.pdf

wavi --dot website/example result/example.dot

wavi --svg website/example result/example.svg --includenodemodules

```

In Ubuntu: 
make sure you add /usr/local/bin to your PATH or use absolute path to wavi.

Example:

```
nodejs /usr/local/bin/wavi --svg ./path/to/website ./graph.png
```


##Example:

![Example](/example/result/example.png?raw=true "Example")

run example/example.cmd in node console or node example

Here are the result of wavi on a couple of framework.

[AngularJs](https://blogwavi.files.wordpress.com/2015/01/angularclassdiagram.jpg)

[JqueryUI](https://blogwavi.files.wordpress.com/2015/01/jqueryuiclassdiagram.jpg)

[Jquery](https://blogwavi.files.wordpress.com/2015/01/jqueryuiclassdiagram.jpg)

[More at the wavi blog](https://blogwavi.wordpress.com/)

##TROUBLESHOOTING

-If your web application is too large and your image is empty or the quality of the image is bad, this means that there is
not sufficent space to draw the diagram. Try using "svg" format.

-Make sure Graphviz is installed and PATH variable is set for Graphviz in your environment variable.
(ex.: C:\Program Files (x86)\Graphviz2.38\bin)

Graphviz download:  http://www.graphviz.org/Download.php

##Contributions

This is a big project to help developers generate quality class diagram. WAVI is in early development and all contributions are welcomed.
For more info on the project contact me at jugle66@hotmail.com


## License

The MIT License (MIT)
Copyright (c) 2014 Bakunin95
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
