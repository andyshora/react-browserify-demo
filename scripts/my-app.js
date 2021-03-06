/** @jsx React.DOM */

var React = require('react'),
  DOM = React.DOM,
  div = DOM.div, img = DOM.img, h1 = DOM.h1, p = DOM.p, input = DOM.input, form = DOM.form;

var Comment = React.createClass({
  render: function() {
    return div({ className: 'comment' }, p({ className: 'comment-author' }, this.props.author), p({}, this.props.text ));
  }
});

var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        this.setState({ data: data });
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
          this.setState({ data: data });
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
    return div({ className: 'commentBox' }, img({ src: 'images/cage.jpg', className: 'cage' }), h1({}, 'Confession'), CommentList({ data: this.state.data }), CommentForm({ onCommentSubmit: this.handleCommentSubmit }));
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
    return form({ className: 'comment-form', onSubmit: this.handleSubmit }, input({ type: 'text', placeholder: 'Your name', ref: 'author' }), input({ type: 'text', placeholder: 'Your confession...', ref: 'text' }), input({ type: 'submit', value: 'post' }));
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
    this.setState({ disabled: false });
  },

  // Then we just update the state whenever its clicked - but you could imagine
  // this being updated with the results of AJAX calls, etc
  handleClick: function() {
    this.setState({ items: this.state.items.concat(this.state.items.length) });
  },

  // For ease of illustration, we just use the React JS methods directly
  // (no JSX cogulmpilation needed)
  // Note that we allow the button to be disabled initially, and then enable it
  // when everything has loaded
  render: function() {
    return CommentBox({ url: 'comments', pollInterval: 20 * 1000, comments: this.props.comments });
  }

});