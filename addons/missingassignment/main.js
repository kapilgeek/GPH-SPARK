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
//alert('asdf');

angular.module('mm.addons.missingassignment', ['mm.core'])

//.constant('mmaNotificationsListLimit', 20) // Max of notifications to retrieve in each WS call.
.constant('mmaMissingassignmentListLimit', 50)
.constant('mmaMissingassignmentPriority', 100)

.config(function($stateProvider, $mmSideMenuDelegateProvider, mmaMissingassignmentPriority) {

    $stateProvider

    .state('site.missingassignment', {
        url: '/missingassignment',
        views: {
            'site': {
                templateUrl: 'addons/missingassignment/templates/list.html',
                controller: 'mmaMissingassignmentListCtrl'
            }
        }
    });

    // Register side menu addon.
    $mmSideMenuDelegateProvider.registerNavHandler('mmaMissingassignment', '$mmaMissingassignmentHandlers.sideMenuNav', mmaMissingassignmentPriority);
})

.run(function($log, $mmaMissingassignment, $mmUtil, $state, $mmAddonManager) {
    $log = $log.getInstance('mmaMissingassignment');

    // Register push notification clicks.
    var $mmPushMissingassignmentDelegate = $mmAddonManager.get('$mmPushMissingassignmentDelegate');
    if ($mmPushMissingassignmentDelegate) {
        $mmPushMissingassignmentDelegate.registerHandler('mmaMissingassignment', function(missingassignment) {
            if ($mmUtil.isTrueOrOne(missingassignment.notif)) {
                $mmaMissingassignment.isPluginEnabledForSite(missingassignment.site).then(function() {
                    $mmaMissingassignment.invalidateMissingassignmentList().finally(function() {
                        $state.go('redirect', {siteid: missingassignment.site, state: 'site.missingassignment'});
                    });
                });
                return true;
            }
        });
    }
});
