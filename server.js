var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var React = require('react'),
// This is our React component, shared by server and browser thanks to browserify
MyApp = require('./scripts/my-app');

var comments = [{author: 'Andy Shora', text: 'Hey there!'}];

app.use('/css', express.static(__dirname + '/css'));
app.use('/scripts', express.static(__dirname + '/scripts'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.setHeader('Content-Type', 'text/html');

  // If we hit the homepage, then we want to serve up some HTML - including the
  // server-side rendered React component(s), as well as the script tags
  // pointing to the client-side code


  // This represents our data to be passed in to the React component for
  // rendering - just as you would pass data, or expose variables in
  // templates such as Jade or Handlebars.  We just use an array of garbage
  // here (with some potentially dangerous values for testing), but you could
  // imagine this would be objects typically fetched async from a DB,
  // filesystem or API, depending on the logged-in user, etc.
  var props = { comments: comments };

  // Now that we've got our data, we can perform the server-side rendering by
  // passing it in as `props` to our React component - and returning an HTML
  // string to be sent to the browser
  var myAppHtml = React.renderComponentToString(MyApp(props));

  res.setHeader('Content-Type', 'text/html');

  // Now send our page content - this could obviously be constructed in
  // another template engine, or even as a top-level React component itself -
  // but easier here just to construct on the fly
  res.end(
    
    '<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    '<title>Hello React</title>' +
    '<link rel=stylesheet href=css/base.css />' +
    '<body>' +

    // Include our static React-rendered HTML in our content div. This is
    // the same div we render the component to on the client side, and by
    // using the same initial data, we can ensure that the contents are the
    // same (React is smart enough to ensure no rendering will actually occur
    // on page load)
    '<div id=content>' + myAppHtml + '</div>' +

    // We'll load React from a CDN - you don't have to do this,
    // you can bundle it up or serve it locally if you like
    '<script src=//fb.me/react-0.11.1.min.js></script>' +
    '<script src="http://fb.me/JSXTransformer-0.10.0.js"></script>' +
    '<script src="http://code.jquery.com/jquery-1.11.1.min.js"></script>' +

    // Then the browser will fetch the browserified bundle, which we serve
    // from the endpoint further down. This exposes our component so it can be
    // referenced from the next script block
    '<script src=/dist/scripts/_bundle.js></script>' +

    // This script renders the component in the browser, referencing it
    // from the browserified bundle, using the same props we used to render
    // server-side. We could have used a window-level variable, or even a
    // JSON-typed script tag, but this option is safe from namespacing and
    // injection issues, and doesn't require parsing
    '<script>' +
      'var MyApp = require("./scripts/my-app.js"), container = document.getElementById("content"); ' +
      'React.renderComponent(MyApp(' + safeStringify(props) + '), container)' +
    '</script>' +
    '</body>' +
    '</html>'
  );

});


app.get('/comments.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(comments));
});

app.post('/comments.json', function(req, res) {
  console.log('posted new comments', req.body);
  comments.push(req.body);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(comments));
});

app.listen(3000);

console.log('Server started: http://localhost:3000/');

// A utility function to safely escape JSON for embedding in a <script> tag
function safeStringify(obj) {
  return JSON.stringify(obj).replace(/<\/script/g, '<\\/script').replace(/<!--/g, '<\\!--')
}
