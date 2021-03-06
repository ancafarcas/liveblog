var login = require('../app/scripts/bower_components/superdesk/client/spec/helpers/utils.js').login,
    blogs = require('./helpers/pages').blogs;

describe('editor embed:', function() {
    'use strict';

    var youtube_url = 'https://www.youtube.com/watch?v=Ksd-a9lIIDc';

    beforeEach(function(done) {login().then(done);});

    it('add a youtube iframe in the editor', function() {
        var editor = blogs.openBlog(0).editor
                            .addTop()
                            .addEmbed();
        // write a youtube url
        editor.embedElement.sendKeys(youtube_url);
        // wait for an iframe
        browser.wait(function() {return editor.iframe.isPresent();}, 5000);
        expect(editor.iframe.isPresent()).toBe(true);
    });

});
