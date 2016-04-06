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
angular.module('mm.addons.academicsummary', ['mm.core'])

//.constant('mmaNotificationsListLimit', 20) // Max of notifications to retrieve in each WS call.
.constant('mmaAcademicsummaryListLimit', 50)
.constant('mmaAcademicsummaryPriority', 800)

.config(function($stateProvider, $mmSideMenuDelegateProvider, mmaAcademicsummaryPriority) {

    $stateProvider

    .state('site.academicsummary', {
        url: '/academicsummary',
        views: {
            'site': {
                templateUrl: 'addons/academicsummary/templates/list.html',
                controller: 'mmaAcademicsummaryListCtrl'
            }
        }
    });

    // Register side menu addon.
    $mmSideMenuDelegateProvider.registerNavHandler('mmaAcademicsummary', '$mmaAcademicsummaryHandlers.sideMenuNav', mmaAcademicsummaryPriority);
})

.run(function($log, $mmaAcademicsummary, $mmUtil, $state, $mmAddonManager) {
    $log = $log.getInstance('mmaAcademicsummary');

    // Register push notification clicks.
    var $mmPushAcademicsummaryDelegate = $mmAddonManager.get('$mmPushAcademicsummaryDelegate');
    if ($mmPushAcademicsummaryDelegate) {
        $mmPushAcademicsummaryDelegate.registerHandler('mmaAcademicsummary', function(academicsummary) {
            if ($mmUtil.isTrueOrOne(academicsummary.notif)) {
                $mmaAcademicsummary.isPluginEnabledForSite(academicsummary.site).then(function() {
                    $mmaAcademicsummary.invalidateAcademicsummaryList().finally(function() {
                        $state.go('redirect', {siteid: academicsummary.site, state: 'site.academicsummary'});
                    });
                });
                return true;
            }
        });
    }
});
