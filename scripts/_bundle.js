require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"xj3AAE":[function(require,module,exports){
/** @jsx React.DOM */

var React = window.React,
  DOM = React.DOM,
  div = DOM.div, button = DOM.button, ul = DOM.ul, li = DOM.li, h1 = DOM.h1, h2 = DOM.h2, span = DOM.span, input = DOM.input, form = DOM.form;

// This is just a simple example of a component that can be rendered on both
// the server and browser

var Comment = React.createClass({
  render: function() {
    return div({ className: 'comment' }, h2({ className: 'commentAuthor' }, this.props.author), span({}, this.props.text ));
  }
});

var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;

    console.log('handleSubmit', comment);

    comments.push(comment);

    this.setState({ data: comments }, function() {
      // `setState` accepts a callback. To avoid (improbable) race condition,
      // `we'll send the ajax request right after we optimistically set the new
      // `state.
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'POST',
        data: comment,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    });
  },
  getInitialState: function() {
    return { data: this.props.comments };
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return div({ className: 'commentBox' }, h1({}, 'Comments Yo!'), CommentList({ data: this.state.data }), CommentForm({ onCommentSubmit: this.handleCommentSubmit }));
  }
});

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment, index) {
      return Comment({ author: comment.author, text: comment.text, key: index });
    });

    return div({ className: 'commentList' }, commentNodes);
  }
});

var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.refs.author.getDOMNode().value.trim();
    var text = this.refs.text.getDOMNode().value.trim();
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text});
    this.refs.author.getDOMNode().value = '';
    this.refs.text.getDOMNode().value = '';
    return;
  },
  render: function() {
    return form({ className: 'commentForm', onSubmit: this.handleSubmit }, input({ type: 'text', placeholder: 'Your name', ref: 'author' }), input({ type: 'text', placeholder: 'Say something...', ref: 'text' }), input({ type: 'submit', value: 'post' }));
  }
});

module.exports = React.createClass({
	// We initialise its state by using the `props` that were passed in when it
  // was first rendered. We also want the button to be disabled until the
  // component has fully mounted on the DOM
  getInitialState: function() {
    return { items: this.props.items, disabled: true };
  },

  // Once the component has been mounted, we can enable the button
  componentDidMount: function() {
    this.setState({disabled: false});
  },

  // Then we just update the state whenever its clicked - but you could imagine
  // this being updated with the results of AJAX calls, etc
  handleClick: function() {
    this.setState({items: this.state.items.concat(this.state.items.length)});
  },

  // For ease of illustration, we just use the React JS methods directly
  // (no JSX compilation needed)
  // Note that we allow the button to be disabled initially, and then enable it
  // when everything has loaded
  render: function() {
    return CommentBox({ url: 'comments.json', pollInterval: 2000, comments: this.props.comments });
  }
});
},{}],"./scripts/my-app.js":[function(require,module,exports){
module.exports=require('xj3AAE');
},{}]},{},["xj3AAE"])