WAVI
===

###Web Application Viewer (Node.js)

Generate a class diagram graph for node.js web application inspired by the Web Application Extension (WAE) for UML.
It is also possible to generate a json report listing files and their relations with metrics.

WAVI is intended for developers who wish to document their web application or as a reverse engineering tool to recover 
the structure of a web application.


## Dependency
```
Require Graphviz installed and PATH variable for Graphviz in your environment.

## Installation

    $ npm install wavi -g

```

##Usage: 

It is strongly advised to use svg format for very large website because jpg/png/pdf are limited in width and height and will most likly not work
or use ratio and the quality will be bad.

wavi --format path/to/website path/to/result/file.type


```
wavi --svg website_example result/example.svg

wavi --jpg website_example result/example.jpg

wavi --png website_example result/example.png

wavi --pdf website_example result/example.pdf

wavi --dot website_example result/example.dot

wavi --json website_example result/example.json
```

##Example:

![Example](/example/result/example.png?raw=true "Example")

run example/example.cmd in node console


##JSON report:
```
List of all nodes and links with escomplex metrics.
compatible with d3.js graph.

example of JSON structure coming soon

##Contributions

This is a big project to help developers generate quality class diagram. WAVI is in early development and all contributions are welcomed.
For more info on the project contact me at jugle66@hotmail.com

```
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
