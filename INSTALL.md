# inspectra

# Install tools, libraries, and dependencies:

1. [Node.js](http://www.nodejs.org) - Works best with Linux and Mac.  Windows is good and getting better.

2. To install global tools, you can use *sudo* or you can change the install path for node libraries to a file path in user space:
```
export NODE_PATH=$HOME/.node
export PATH=$NODE_PATH:$PATH
```

3. Using *npm*, the node package manager, globally install the core build tools, yeoman, grunt, and bower:
```
cd /path/to/project
npm install -g yo grunt-cli bower
```

4. Now install the build and test dependencies:
```
cd /path/to/project
npm install
```

This downloads and install node dependencies listed in package.json to the `node_modules` subdirectory

5. Install the client-side dependencies using bower:
```
cd /path/to/project
bower install
```

# Build the project:

The web application is built by using grunt:
```
grunt build
```

The entire static package should be created in the `dist` subdirectory.  This directory can be copied, as is, to the web server.

# Developing the project:

The web application can be served while in development with:
```
grunt server &
```

This serves the web app locally, opens a browser pointed at the local web server, and opens a watch task that reloads the browser automatically when core files (html, css, js) are modified.
It does not build the web app for distibution, as the code becomes difficult to debug when uglified/minified.
