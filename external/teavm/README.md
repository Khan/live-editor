# TeaVM JavaC Web Worker
This code comes from the [TeaVM](http://teavm.org) project.  Specifically, it is a build of the [TeaVM JavaC](https://github.com/konsoletyper/teavm-javac) project which uses TeaVM to transpile Java code in the browser to JavaScript.

## Notable files
- runtime.js: this is used both to compile AND execute.  It is the TeaVM runtime support for any transpiled code to execute.
- worker.js: this is a Web Worker process to transpile Java code.  We host it for our compile step
- classes.js: The transpiled compiler
- classlib.txt: Actually a zip file, I think?  Includes Java bytecode for all of the classes for the compiler worker to link against.

## Compiling these files
We have a custom fork of TeaVM JavaC which includes our `org.khanacademy.cs.*` library.  This is what lets us interface with Processing.js and is a place where we can add any other utilities we'd like.  You can build it using these commands:

```
git clone https://github.com/Khan/teavm-javac/tree/drawing-library
cd teavm-javac
mvn install
mvn package
```

Then, you can copy the file into this project:
```
./ui/target/teavm-javac-ui-1.0-SNAPSHOT/teavm/worker/classes.js
./ui/target/teavm-javac-ui-1.0-SNAPSHOT/classlib.txt
./ui/target/teavm-javac-ui-1.0-SNAPSHOT/teavm/runtime.js
./ui/target/teavm-javac-ui-1.0-SNAPSHOT/worker.js
```
