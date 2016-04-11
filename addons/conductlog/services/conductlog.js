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
//conductlog


angular.module('mm.addons.conductlog')

/**
 * Service to handle notifications (messages).
 *
 * @module mm.addons.conductlog
 * @ngdoc service
 * @name $mmaConductlog
 */
.factory('$mmaConductlog', function($q, $log, $mmSite, $mmSitesManager, mmaConductlogListLimit) {
    
    $log = $log.getInstance('$mmaConductlog');

    var self = {};

    // Function to format Conductlog data.
    function formatConductlogData(conductlog) {
        angular.forEach(conductlog, function(conductlog) {
            // Set message to show.
            if (conductlog.contexturl && conductlog.contexturl.indexOf('/mod/forum/')) {
                conductlog.mobiletext = conductlog.smallmessage;
            } else {
                conductlog.mobiletext = conductlog.fullmessage;
            }

            // Try to set courseid the notification belongs to.
            var cid = conductlog.summary.match(/course\/view\.php\?id=([^"]*)/);
            if (cid && cid[1]) {
                conductlog.courseid = cid[1];
            }
        });
    }

    /**
     * Get cache key for notification list WS calls.
     *
     * @return {String} Cache key.
     */
    function getConductlogCacheKey() {
        return 'mmaConductlog:list';
    };

    /**
     * Get conductlog from site.
     *
     * @module mm.addons.notifications
     * @ngdoc method
     * @name $mmaNotifications#getNotifications
     * @param {Boolean} read       True if should get read notifications, false otherwise.
     * @param {Number} limitFrom   Position of the first notification to get.
     * @param {Number} limitNumber Number of notifications to get.
     * @return {Promise}           Promise resolved with notifications.
     */
    self.getConductlog = function(read, limitFrom, limitNumber) {
        limitFrom = limitFrom || 0;
        limitNumber = limitNumber || mmaConductlogListLimit;

        $log.debug('Get ' + (read ? 'read' : 'unread') + ' conductlog from ' + limitFrom + '. Limit: ' + limitNumber);

        var data = {
            useridto: $mmSite.getUserId(),
            useridfrom: 0,
            type: 'conductlog',
            read: read ? 1 : 0,
            newestfirst: 1,
            limitfrom: limitFrom,
            limitnum: limitNumber
        };
        var preSets = {
            cacheKey: getConductlogCacheKey()
        };

        // Get unread notifications.
        return $mmSite.read('core_message_get_messages', data, preSets).then(function(response) {
            if (response.summary) {
                var conductlog = response;
               // formatConductlogData(conductlog);
                return conductlog;
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
    self.getReadConductlog = function(limitFrom, limitNumber) {
        return self.getConductlog(true, limitFrom, limitNumber);
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
    self.getUnreadConductlog = function(limitFrom, limitNumber) {
        return self.getConductlog(false, limitFrom, limitNumber);
    };

    /**
     * Invalidates Conductlog list WS calls.
     *
     * @module mm.addons.conductlog
     * @ngdoc method
     * @name $mmaNotifications#invalidateNotificationsList
     * @return {Promise} Promise resolved when the list is invalidated.
     */
    self.invalidateConductlogList = function() {
        return $mmSite.invalidateWsCacheForKey(getConductlogCacheKey());
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
