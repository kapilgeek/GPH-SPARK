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

angular.module('mm.addons.mod_forum')

/**
 * Add new discussion controller.
 *
 * @module mm.addons.mod_forum
 * @ngdoc controller
 * @name mmaModForumNewDiscussionCtrl
 */
.controller('mmaModForumNewDiscussionCtrl', function($scope, $stateParams, $mmGroups, $q, $mmaModForum, $mmEvents, $ionicPlatform,
            $mmUtil, $ionicHistory, $translate, mmaModForumNewDiscussionEvent) {

    var courseid = $stateParams.courseid,
        forumid = $stateParams.forumid,
        cmid = $stateParams.cmid;

    $scope.newdiscussion = {
        subject: '',
        message: '',
        subscribe: true
    };

    // Fetch if forum uses groups and the groups it uses.
    function fetchGroups(refresh) {
        return $mmGroups.getActivityGroupMode(cmid).then(function(mode) {
            if (mode === $mmGroups.SEPARATEGROUPS || mode === $mmGroups.VISIBLEGROUPS) {
                return $mmGroups.getActivityAllowedGroups(cmid).then(function(forumgroups) {
                    var promise;
                    if (mode === $mmGroups.VISIBLEGROUPS) {
                        // We need to check which of the returned groups the user belongs to.
                        promise = $mmGroups.getUserGroupsInCourse(courseid, refresh).then(function(usergroups) {
                            if (usergroups.length === 0) {
                                // User doesn't belong to any group, probably a teacher. Let's return all groups,
                                // if the user can't post to some of them it will be filtered by add discussion WS.
                                return forumgroups;
                            }
                            return filterGroups(forumgroups, usergroups);
                        });
                    } else {
                        // WS already filters groups, no need to do it ourselves.
                        promise = $q.when(forumgroups);
                    }

                    return promise.then(function(forumgroups) {
                        if (forumgroups.length > 0) {
                            $scope.groups = forumgroups;
                            $scope.newdiscussion.groupid = forumgroups[0].id;
                            $scope.showGroups = true;
                            $scope.showForm = true;
                        } else {
                            var message = mode === $mmGroups.SEPARATEGROUPS ?
                                                'mma.mod_forum.cannotadddiscussionall' : 'mma.mod_forum.cannotadddiscussion';
                            return $q.reject($translate.instant(message));
                        }
                    });
                });
            } else {
                $scope.showGroups = false;
                $scope.showForm = true;
            }
        }).catch(function(message) {
            if (message) {
                $mmUtil.showErrorModal(message);
            } else {
                $mmUtil.showErrorModal('mma.mod_forum.errorgetgroups', true);
            }
            $scope.showForm = false;
            return $q.reject();
        });
    }

    // Filter forumgroups, returning only those that are inside usergroups.
    function filterGroups(forumgroups, usergroups) {
        var filtered = [],
            usergroupsids = usergroups.map(function(g) {
                return g.id;
            });

        angular.forEach(forumgroups, function(fg) {
            if (usergroupsids.indexOf(fg.id) > -1) {
                filtered.push(fg);
            }
        });

        return filtered;
    }

    fetchGroups().finally(function() {
        $scope.groupsLoaded = true;
    });

    // Pull to refresh.
    $scope.refreshGroups = function() {
        var p1 = $mmGroups.invalidateActivityGroupMode(cmid),
            p2 = $mmGroups.invalidateActivityAllowedGroups(cmid);

        $q.all([p1, p2]).finally(function() {
            fetchGroups(true).finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        });
    };

    // Add a new discussion.
    $scope.add = function() {
        var subject = $scope.newdiscussion.subject,
            message = $scope.newdiscussion.message,
            subscribe = $scope.newdiscussion.subscribe,
            groupid = $scope.newdiscussion.groupid;

        if (!subject) {
            $mmUtil.showErrorModal('mma.mod_forum.erroremptysubject', true);
            return;
        }
        if (!message) {
            $mmUtil.showErrorModal('mma.mod_forum.erroremptymessage', true);
            return;
        }
        message = '<p>' + message + '<p>';

        $mmaModForum.addNewDiscussion(forumid, subject, message, subscribe, groupid).then(function(discussionid) {
            var data = {
                forumid: forumid,
                discussionid: discussionid,
                cmid: cmid
            };
            $mmEvents.trigger(mmaModForumNewDiscussionEvent, data);

            if ($ionicPlatform.isTablet()) {
                // Empty form.
                $scope.newdiscussion.subject = '';
                $scope.newdiscussion.message = '';
            } else {
                // Go back to discussions list.
                $ionicHistory.goBack();
            }
        }).catch(function(message) {
            if (message) {
                $mmUtil.showErrorModal(message);
            } else {
                $mmUtil.showErrorModal('mma.mod_forum.cannotcreatediscussion', true);
            }
        });
    };
});
