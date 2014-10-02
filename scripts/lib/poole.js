/**
 * Pool Client, a promise-based wrapper for PooleApp.com
 * Author: @andyshora
 * Version: 1.0
 */

var Q = require('q'),
request = require('request');

module.exports = {

  key: null,
  secret: null,
  saveUrl: null,
  dataUrl: null,

  add: function(formData) {

    // make async with promise
    var deferred = Q.defer();

    // check form data is an object
    if (typeof formData !== 'object') {
      return Q.reject('form data invalid');
    }

    // check lib has been initialised with API keys
    if (!(this.saveUrl && this.dataUrl)) {
      console.error('poole has not been initialized with an apiKey and apiSecret. call init() with this data.');
      return Q.reject('not initialized');

    } else {
      // do post to save data
      request.post(this.saveUrl, { form: formData }, function(err, response, body) {
        if (err) {
          console.error('upload failed:', err);
          deferred.reject(err);
        } else {
          // save successful
          deferred.resolve(body);
        }
      });
    }

    return deferred.promise;
  },

  get: function() {

    // make async with promise
    var deferred = Q.defer();

    // check lib has been initialised with API keys
    if (!(this.saveUrl && this.dataUrl)) {
      console.error('poole has not been initialized with an apiKey and apiSecret. call init() with this data.');
      return Q.reject('not initialized');

    } else {

      // GET data
      request(this.dataUrl, function (err, response, body) {
        if (err) {
          deferred.reject('failed to GET pool data', err);

        } else {

          try {
            // try to parse response as JSON
            var data = JSON.parse(body);

            if ('sessions' in data) {
              deferred.resolve(data.sessions);
            } else {
              deferred.reject('sessions key not found in response data');
            }
          } catch(ex) {
            deferred.reject('pool response was not valid JSON');
          }
          
        }
      });

    }

    return deferred.promise;
  },
  init: function(_key, _secret) {
    // set API keys and update get and fetch urls
    this.key = _key;
    this.secret = _secret;
    this.saveUrl = 'http://pooleapp.com/stash/' + this.key + '/';
    this.dataUrl = 'http://pooleapp.com/data/' + this.secret + '.json';

    console.log('pool initialized');
    console.log('saveUrl: ' + this.saveUrl);
    console.log('dataUrl: ' + this.dataUrl);

  }
};

