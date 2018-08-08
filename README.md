[![Build Status](https://travis-ci.org/Khan/live-editor.svg?branch=master)](https://travis-ci.org/Khan/live-editor) [![Code Climate](https://codeclimate.com/github/Khan/live-editor/badges/gpa.svg)](https://codeclimate.com/github/Khan/live-editor)
# Live Code Editor (in maintence mode)

**WARNING:** This project is currently in maintenance mode.  Please feel free to file bug reports.  If determine that the issue is serious enough we will fix it.  Please do not submit PRs.  We don't have the resources to review them and they'll be closed.

[![Join the chat at https://gitter.im/Khan/live-editor](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Khan/live-editor?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This is the live coding environment developed for the [Khan Academy Computer Programming curriculum](https://www.khanacademy.org/computer-programming/). It gives learners an editor on the left (either ACE or our Blocks-based drag-and-drop editor) and an output on the right (either JS+ProcessingJS, HTML, or SQL).
Here's a [tour of how it's used on KA](https://www.youtube.com/watch?v=bPCWwEApKw4).

You can find various demos in the `demos/` directory, and start playing immediately with the simple demo:

* [http://khan.github.io/live-editor/demos/simple/](http://khan.github.io/live-editor/demos/simple/)

## Running

In order to run `live-editor` locally you'll have run a local web server.  If you have python installed this can be accomplished by running the following command from the `live-editor` folder:

    python -m SimpleHTTPServer

You should see the following console output:

    Serving HTTP on 0.0.0.0 port 8000 ...

Open up a browser and navigate to http://0.0.0.0:8000/demos/simple.

## Building

**WARNING:** This project requires node ~6 and npm ~3 in order for `npm install`
to work correctly.

You can use the pre-built copies of everything inside the `build/` directory. If you wish to make some changes and re-build the library from scratch you'll need to install some dependencies:

    git submodule update --init --recursive
    npm install

At this point you can make a fresh build, using [Gulp](http://gulpjs.com/):

    npm run build


## Testing

The tests are in the `/tests` folder. They use Mocha/Chai/Sinon. Gulp typically runs the tests when relevant files change, but you can explicitly run the tests with:

    npm test

You can also run single test suites at a time - see gulpfile.js for what suites are available:

    gulp test_output_pjs_assert

You can run the tests in the browser runner by opening the relevant webpage:

    open tests/output/sql/index.html

[TravisCI](https://travis-ci.org/Khan/live-editor/) also runs those tests when new commits are made.

In order to run the tests that create Worker threads, you'll need to run Chrome with a flag:

    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files

Please add tests whenever possible for any change that you make or propose.

## How you can help

We have many open issues here. The top priority are those marked as [regressionbug](https://github.com/Khan/live-editor/labels/regressionbug), since those are things that used to work. After that, the ones marked as [browserbug](https://github.com/Khan/live-editor/labels/browserbug) may be the easiest to take on, and there are also plain old [bug](https://github.com/Khan/live-editor/labels/bug)s. All the issues are tagged according to their environment, [pjs](https://github.com/Khan/live-editor/labels/pjs), [webpage](https://github.com/Khan/live-editor/labels/webpage), [sql](https://github.com/Khan/live-editor/labels/sql), or if they're generally about the ACE editor, [editor](https://github.com/Khan/live-editor/labels/editor). There are also a few bugs specifically about the [demo](https://github.com/Khan/live-editor/labels/demo) pages, since those can get behind, and requests for more [tests](https://github.com/Khan/live-editor/labels/tests), since we can always use more of those!

Some aspects of the editor are in subrepos with their own issue trackers, like structuredjs and structuredblocks, so be sure to poke around those and see if they're more up your bug-fixing alley.

There are also a handful of [idea](https://github.com/Khan/live-editor/labels/idea)s floating here from our community. You are welcome to take them on, but it's possible we won't merge them if we worry about their effect on the programming experience on Khan Academy, like if they may introduce backwards compatibilities or performance regressions.

We have no full-time resource working on the editing environment right now, so we will do pull requests when we find ourselves with time between other projects. We thank you for your contribution, even if we may be slow to acknowledge it at times. :)

## Pull Requests

When submitting pull request please do the following:

- link to an issue, if no issue exists please create one
- write automated tests for new functionality or bug fixes
- include build files
- run the automated tests
- squash your commits into a single a commit

Before we can accept any pull requests you must sign our [CLA](https://www.khanacademy.org/r/cla).

## How it works

For a deep dive into the components of the LiveEditor, [read this wiki](https://github.com/Khan/live-editor/wiki/How-the-live-editor-works).

You can also watch these talks that the team has given about the editor:
* [John Resig on CodeGenius](https://www.youtube.com/watch?v=H4sSldXv_S4)
* [Pamela Fox at ReactConf](https://youtu.be/EzHsLt9vLbk?t=26m49s)
