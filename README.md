# Live Code Editor

The live code editor developed for the [Khan Academy Computer Science curriculum](https://www.khanacademy.org/cs/).

## How to Use

Demos of how to use the editor can be found in the `demos/` directory. Specifically a good place to start is with the simple demo:

* [http://khan.github.io/live-editor/demos/simple/](http://khan.github.io/live-editor/demos/simple/)


## LiveEditor Options

To configure the LiveEditor...

## How it Works

For a deep dive into the components of the LiveEditor, [read this wiki](https://github.com/Khan/live-editor/wiki/How-the-live-editor-works).


## Building

You can use the pre-built copies of everything inside the `build/` directory. If you wish to make some changes and re-build the library from scratch you'll need to install some dependencies:

    git submodule update
    npm install
    bower install
    
    # Build the Ace editor files
    cd bower_components/ace
    npm install
    make build

At this point you can make a fresh build, using [Gulp](http://gulpjs.com/):

    gulp
