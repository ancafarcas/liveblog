var login = require('../app/scripts/bower_components/superdesk/client/spec/helpers/utils.js').login,
    themeManager = require('./helpers/pages').themeManager,
    path = require('path');

describe('Themes Manager', function() {
    'use strict';

    beforeEach(function(done) {login().then(done);});

    it('can open theme manager and list the themes', function() {
        themeManager.openThemesManager()
        .themes
        .then(function(themes) {
            expect(themes.length).toBe(3);
            // angular
            themeManager.expectTheme(0, {number_of_blogs_expected: 0, is_default_theme:false, name: 'Angular Based Theme'});
            // classic
            themeManager.expectTheme(1, {number_of_blogs_expected: 5, is_default_theme:true, name: 'Classic Theme'});
            // open a thumbnail
            themeManager.openPreview(1);
            // forest
            themeManager.expectTheme(2, {number_of_blogs_expected: 0, is_default_theme:false, name: 'forest'});
        });
    });

    it('can set a theme as default', function() {
        themeManager.openThemesManager()
        .setAsDefault(2)
        .then(function() {
            // forest
            themeManager.expectTheme(2, {number_of_blogs_expected: 0, is_default_theme:true, name: 'forest'});
            // classic
            themeManager.expectTheme(1, {number_of_blogs_expected: 5, is_default_theme:false, name: 'Classic Theme'});
        });
    });

    it('can upload a new theme', function() {
        themeManager.openThemesManager()
            .fileThemeElement.sendKeys(path.resolve(__dirname, './upload/dog-theme.zip'));
        browser.wait(function() {
            return themeManager.themes.count().then(function(count) {
                return count === 4;
            });
        }, 10000);
        themeManager.themes.then(function(themes) {
            expect(themes.length).toBe(4);
            // actual-dog
            themeManager.expectTheme(1, {number_of_blogs_expected: 0, is_default_theme:false, name: 'Actual Dog'});
        });
    });

    it('can remove a theme', function() {
        themeManager.openThemesManager()
        .themes
        .then(function(themes) {
            // removing forest theme
            themeManager.remove(2);
            browser.waitForAngular();
            themeManager.openThemesManager()
            .themes.then(function(newThemes) {
                expect(newThemes.length).toEqual(themes.length - 1);
            });
        });
    });

    it('can change theme settings', function() {
        themeManager.openThemesManager()
        .themes
        .then(function(themes) {
            themeManager.openSettingsForTheme(0);
            element(by.css('[name="postsPerPage"]')).clear().sendKeys('111');
            themeManager.saveSettings();
            browser.waitForAngular();
            themeManager.openSettingsForTheme(0);
            expect(element(by.css('[name="postsPerPage"]')).getAttribute('value')).toEqual('111');
        });
    });
});
