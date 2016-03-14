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
 * Service to handle notifications (messages).
 *
 * @module mm.addons.academicsummary
 * @ngdoc service
 * @name $mmaAcademicsummary
 */
.factory('$mmaAcademicsummary', function($q, $log, $mmSite, $mmSitesManager, mmaAcademicsummaryListLimit) {

    $log = $log.getInstance('$mmaAcademicsummary');

    var self = {};

    // Function to format Academicsummary data.
    function formatAcademicsummaryData(academicsummary) {
        angular.forEach(academicsummary, function(academicsummary) {
            // Set message to show.
            if (academicsummary.contexturl && academicsummary.contexturl.indexOf('/mod/forum/')) {
                academicsummary.mobiletext = academicsummary.smallmessage;
            } else {
                academicsummary.mobiletext = academicsummary.fullmessage;
            }

            // Try to set courseid the notification belongs to.
            var cid = academicsummary.summary.match(/course\/view\.php\?id=([^"]*)/);
            if (cid && cid[1]) {
                academicsummary.courseid = cid[1];
            }
        });
    }

    /**
     * Get cache key for notification list WS calls.
     *
     * @return {String} Cache key.
     */
    function getAcademicsummaryCacheKey() {
        return 'mmaAcademicsummary:list';
    };

    /**
     * Get academicsummary from site.
     *
     * @module mm.addons.notifications
     * @ngdoc method
     * @name $mmaNotifications#getNotifications
     * @param {Boolean} read       True if should get read notifications, false otherwise.
     * @param {Number} limitFrom   Position of the first notification to get.
     * @param {Number} limitNumber Number of notifications to get.
     * @return {Promise}           Promise resolved with notifications.
     */
    self.getAcademicsummary = function(read, limitFrom, limitNumber) {
        limitFrom = limitFrom || 0;
        limitNumber = limitNumber || mmaAcademicsummaryListLimit;

        $log.debug('Get ' + (read ? 'read' : 'unread') + ' academicsummary from ' + limitFrom + '. Limit: ' + limitNumber);

        var data = {
            useridto: $mmSite.getUserId(),
            useridfrom: 0,
            type: 'academicsummary',
            read: read ? 1 : 0,
            newestfirst: 1,
            limitfrom: limitFrom,
            limitnum: limitNumber
        };
        var preSets = {
            cacheKey: getAcademicsummaryCacheKey()
        };

        // Get unread notifications.
        return $mmSite.read('core_message_get_messages', data, preSets).then(function(response) {
            if (response.summary) {
                var academicsummary = response;
               // formatAcademicsummaryData(academicsummary);
                return academicsummary;
            } else {
                return $q.reject();
            }
        });
    };

    /**
     * Get read notifications from site.
     *
     * @module mm.addons.notifications
     * @ngdoc method
     * @name $mmaNotifications#getReadNotifications
     * @param {Number} limitFrom   Position of the first notification to get.
     * @param {Number} limitNumber Number of notifications to get.
     * @return {Promise}           Promise resolved with notifications.
     */
    self.getReadAcademicsummary = function(limitFrom, limitNumber) {
        return self.getAcademicsummary(true, limitFrom, limitNumber);
    };

    /**
     * Get unread notifications from site.
     *
     * @module mm.addons.notifications
     * @ngdoc method
     * @name $mmaNotifications#getUnreadNotifications
     * @param {Number} limitFrom   Position of the first notification to get.
     * @param {Number} limitNumber Number of notifications to get.
     * @return {Promise}           Promise resolved with notifications.
     */
    self.getUnreadAcademicsummary = function(limitFrom, limitNumber) {
        return self.getAcademicsummary(false, limitFrom, limitNumber);
    };

    /**
     * Invalidates Academicsummary list WS calls.
     *
     * @module mm.addons.academicsummary
     * @ngdoc method
     * @name $mmaNotifications#invalidateNotificationsList
     * @return {Promise} Promise resolved when the list is invalidated.
     */
    self.invalidateAcademicsummaryList = function() {
        return $mmSite.invalidateWsCacheForKey(getAcademicsummaryCacheKey());
    };

    /**
     * Check if plugin is available.
     *
     * @module mm.addons.notifications
     * @ngdoc method
     * @name $mmaNotifications#isPluginEnabled
     * @return {Boolean} True if plugin is available, false otherwise.
     */
    self.isPluginEnabled = function() {
        return $mmSite.wsAvailable('core_message_get_messages');
    };

    /**
     * Check if plugin is available for a certain site.
     *
     * @module mm.addons.notifications
     * @ngdoc method
     * @name $mmaNotifications#isPluginEnabledForSite
     * @param {String} siteid Site ID.
     * @return {Promise}      Resolved when enabled, otherwise rejected.
     */
    self.isPluginEnabledForSite = function(siteid) {
        return $mmSitesManager.getSite(siteid).then(function(site) {
            if (!site.wsAvailable('core_message_get_messages')) {
                return $q.reject();
            }
        });
    };

    return self;
});
