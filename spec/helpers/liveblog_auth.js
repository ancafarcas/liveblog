'use strict';

/*global protractor */

var request = require('request');

var getBackendUrl = require('./liveblog_backend').getBackendUrl;

var pp = protractor.getInstance().params;

exports.getToken = getToken;

// acquire auth token using API
function getToken(callback) {
    var username = pp.username,
        password = pp.password;
    request.post({
            rejectUnauthorized: false,
            url: getBackendUrl('/auth'),
            json: {
                'username': username,
                'password': password
            }
        }, function(error, response, json) {
            if (error) {
                throw new Error(error);
            }
            if (!json.token) {
                throw new Error(json);
            }
            pp.token = json.token;
            callback(error, response, json);
        }
    );
}
