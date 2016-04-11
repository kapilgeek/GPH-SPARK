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
 * Controller to handle conductlog list.
 *
 * @module mm.addons.conductlog
 * @ngdoc controller
 * @name mmaConductlogListCtrl
 */
.controller('mmaConductlogListCtrl', function($scope, $mmUtil, $mmaConductlog, mmaConductlogListLimit, $sce, $compile, $state) {

    var readCount = 0,
        unreadCount = 0;
    $scope.conductlog = [];
    $scope.conductlogcourse = [];


    $scope.action = function(e, course) {
        //alert('asdf');
       // console.log(course);
        $state.go('site.mm_course', {course: course});
        e.preventDefault();
        e.stopPropagation();
    };
    
    $scope.actionGrade = function(e, course) {
        //alert('asdf');
       // console.log(course);
        $state.go('site.grades', {course: course});
        e.preventDefault();
        e.stopPropagation();
    };

    // Convenience function to get conductlog. Get unread notifications first.
    function fetchConductlog(refresh) {

        if (refresh) {
            readCount = 0;
            unreadCount = 0;
        }


        return $mmaConductlog.getConductlog(true,unreadCount, mmaConductlogListLimit).then(function(gotSummary) {
            $scope.conductlog = gotSummary;
           // console.log(gotSummary);
            $scope.conductlogcourse = gotSummary.summary['courseData'];
           // console.log(gotSummary.summary['courseData']);
            //console.log(gotSummary.summary.courseData);
            $scope.canLoadMore = false;
        }, function(error) {
                   // alert('ocean three');
                    if (error) {
                        $mmUtil.showErrorModal(error);
                    } else {
                        $mmUtil.showErrorModal('mma.conductlog.errorgetconductlog', true);
                    }
                    $scope.canLoadMore = false;
        });

        /*return $mmaConductlog.getUnreadConductlog(unreadCount, mmaConductlogListLimit).then(function(unread) {
            // Don't add the unread notifications to $scope.notifications yet. If there are no unread notifications
            // that causes that the "There are no notifications" message is shown in pull to refresh.
            unreadCount += unread.length;

            if (unread.length < mmaConductlogListLimit) {
                // Limit not reached. Get read notifications until reach the limit.
                var readLimit = mmaConductlogListLimit - unread.length;
                return $mmaConductlog.getReadConductlog(readCount, readLimit).then(function(read) {
                    readCount += read.length;
                    if (refresh) {
                        $scope.conductlog = unread.concat(read);
                    } else {
                        $scope.conductlog = $scope.conductlog.concat(unread).concat(read);
                    }
                    $scope.canLoadMore = read.length >= readLimit;
                    $scope.summaryHTML = $sce.trustAsHtml($scope.conductlog[0].summary);
                }, function(error) {
                    if (unread.length == 0) {
                        if (error) {
                            $mmUtil.showErrorModal(error);
                        } else {
                            $mmUtil.showErrorModal('mma.conductlog.errorgetConductlog', true);
                        }
                        $scope.canLoadMore = false; // Set to false to prevent infinite calls with infinite-loading.
                    }
                });
            } else {
                if (refresh) {
                    $scope.conductlog = unread;
                } else {
                    $scope.conductlog = $scope.conductlog.concat(unread);
                }
                $scope.summaryHTML = $sce.trustAsHtml($scope.conductlog[0].summary);
                $scope.canLoadMore = true;
            }
        }, function(error) {
            if (error) {
                $mmUtil.showErrorModal(error);
            } else {
                $mmUtil.showErrorModal('mma.conductlog.errorgetconductlog', true);
            }
            $scope.canLoadMore = false; // Set to false to prevent infinite calls with infinite-loading.
        });*/
    }
    fetchConductlog().finally(function() {
        $scope.conductlogLoaded = true;
    });

    $scope.refreshConductlog = function() {
        $mmaConductlog.invalidateConductlogList().finally(function() {
            fetchConductlog(true).finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        });
    };

    $scope.loadMoreConductlog = function(){
        fetchConductlog().finally(function() {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };
});
