(function() {
    'use strict';

    ThemeSettingsModalController.$inject = ['$scope', 'api', '$q', 'lodash', 'notify'];
    function ThemeSettingsModalController($scope, api, $q, _, notify) {
        var vm = this;
        angular.extend(vm, {
            optionsAreloading: true,
            modalOpened: angular.isDefined(vm.theme),
            settings: angular.copy(vm.theme.settings) || {},
            options: [],
            submitSettings: function(shouldClose) {
                if (!angular.equals(vm.theme.settings, vm.settings)) {
                    api.themes.update(vm.theme, {settings: vm.settings}).then(function(data) {
                        vm.settings = angular.copy(data.settings);
                        // reset the dirty state to false
                        vm.themeSettingsForm.$setPristine();
                        if (shouldClose) {
                            vm.closeModal();
                        }
                    }, function(error) {
                        notify.error(error.data._error.message);
                    });
                } else {
                    if (shouldClose) {
                        vm.closeModal();
                    }
                }
            },
            closeModal: function() {
                vm.modalOpened = false;
                vm.theme = undefined;
            },
            /**
             * Check if the option requirements are satified through the `dependsOn` property
             * @param {object} option
             * @returns {boolean} true if the option `dependsOn` are satisfied
             */
            optionRequirementIsSatisfied: function(option) {
                if (!angular.isDefined(option.dependsOn)) {
                    return true;
                }
                var isSatisfied = true;
                angular.forEach(option.dependsOn, function(value, key) {
                    isSatisfied = isSatisfied && vm.settings[key] === value;
                });
                return isSatisfied;
            }
        });
        // Initialization
        /**
         * Collect a list of options for the given theme and its parents
         * @param {object} theme
         * @returns {array} list of options
         */
        function collectOptions(theme, options) {
            // options is used for recursiveness
            options = options || [];
            // keep the theme's options in `options`
            if (theme.options) {
                var alreadyPresent = _.map(options, function(o) {return o.name;});
                // keep only options that are not already saved (children options are prioritary)
                options = _.filter(theme.options, function(option) {
                    return alreadyPresent.indexOf(option.name) === -1;
                }).concat(options);
            }
            // retrieve parent options
            if (theme['extends']) {
                return api.themes.getById(theme['extends']).then(function(parentTheme) {
                    return collectOptions(parentTheme, options);
                });
            } else {
                // return the options when there is no more parent theme
                return $q.when(options);
            }
        }
        // collect the options for the theme and its parents
        collectOptions(vm.theme).then(function(options) {
            // set default settings value from options default values
            options.forEach(function(option) {
                if (!angular.isDefined(vm.settings[option.name])) {
                    vm.settings[option.name] = option['default'];
                }
            });
            angular.extend(vm, {
                options: options,
                optionsAreloading: false
            });
        });
        // watch the modalOpened model to reset the selected theme when the user close the modal
        $scope.$watch(
            function() {return vm.modalOpened;},
            function(isOpened) {
                if (!isOpened) {
                    vm.closeModal();
                }
            }
        );
    }

    angular.module('liveblog.themes')
    .directive('themeSettingsModal', function() {
        return {
            templateUrl: 'scripts/liveblog-themes/views/theme-settings-modal.html',
            scope: {
                theme: '=theme'
            },
            controllerAs: 'vm',
            bindToController: true,
            controller: ThemeSettingsModalController
        };
    });
})();
