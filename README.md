# ASCII Fractals

Following on from [webgl-fractals](https://github.com/kirjavascript/webgl-fractals)

To display the text, on each render a string is generated and passed to a single pre element.

The colours are also displayed from a single element. The method used takes advantage of the ability to chain multiple box-shadow values to a single property.

This presents a problem when trying to line up the colours with text, due to text rendering being completely inconsistent between browsers and OSes. The current solution is to simply make adjustments for the different environments.

At the time of writing, this has been tested on all available versions of firefox, chrome, and edge on windows, mac, and linux - but full support is extremely unlikely.