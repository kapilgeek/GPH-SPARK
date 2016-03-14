// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

angular.module('mm.addons.academicsummary')

/**
 * Academicsummary handlers factory.
 *
 * This factory holds the different handlers used for delegates.
 *
 * @module mm.addons.academicsummary
 * @ngdoc service
 * @name $mmaAcademicsummaryHandlers
 */
.factory('$mmaAcademicsummaryHandlers', function($log, $mmaAcademicsummary) {
    $log = $log.getInstance('$mmaAcademicsummaryHandlers');

    var self = {};

    /**
     * Side menu nav handler.
     *
     * @module mm.addons.academicsummary
     * @ngdoc method
     * @name $mmaAcademicsummaryHandlers#sideMenuNav
     */
    self.sideMenuNav = function() {

        var self = {};

        /**
         * Check if handler is enabled.
         *
         * @return {Boolean} True if handler is enabled, false otherwise.
         */
        self.isEnabled = function() {
            return $mmaAcademicsummary.isPluginEnabled();
        };

        /**
         * Get the controller.
         *
         * @return {Object} Controller.
         */
        self.getController = function() {

            /**
             * Side menu nav handler controller.
             *
             * @module mm.addons.academicsummary
             * @ngdoc controller
             * @name $mmaAcademicsummaryHandlers#sideMenuNav:controller
             */
            return function($scope) {
                $scope.icon = 'ion-ios-bell';
                $scope.title = 'mma.academicsummary.academicsummary';
                $scope.state = 'site.academicsummary';
            };
        };

        return self;
    };

    return self;
});
