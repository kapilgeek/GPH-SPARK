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
 * Controller to handle academicsummary list.
 *
 * @module mm.addons.academicsummary
 * @ngdoc controller
 * @name mmaAcademicsummaryListCtrl
 */
.controller('mmaAcademicsummaryListCtrl', function($scope, $mmUtil, $mmaAcademicsummary, mmaAcademicsummaryListLimit, $sce, $compile, $state) {

    var readCount = 0,
        unreadCount = 0;
    $scope.academicsummary = [];
    $scope.academicsummarycourse = [];


    $scope.action = function(e, course) {       
        $state.go('site.mm_course', {course: course});
        e.preventDefault();
        e.stopPropagation();
    };
    
    $scope.actionGrade = function(e, course) {      
        $state.go('site.grades', {course: course});
        e.preventDefault();
        e.stopPropagation();
    };

    // Convenience function to get academicsummary. Get unread notifications first.
    function fetchAcademicsummary(refresh) {

        if (refresh) {
            readCount = 0;
            unreadCount = 0;
        }


        return $mmaAcademicsummary.getAcademicsummary(true,unreadCount, mmaAcademicsummaryListLimit).then(function(gotSummary) {
            $scope.academicsummary = gotSummary;            
            $scope.academicsummarycourse = gotSummary.summary['courseData'];            
            $scope.canLoadMore = false;
        }, function(error) {
                    
                    if (error) {
                        $mmUtil.showErrorModal(error);
                    } else {
                        $mmUtil.showErrorModal('mma.academicsummary.errorgetacademicsummary', true);
                    }
                    $scope.canLoadMore = false;
        });

        
    }
    fetchAcademicsummary().finally(function() {
        $scope.academicsummaryLoaded = true;
    });

    $scope.refreshAcademicsummary = function() {
        $mmaAcademicsummary.invalidateAcademicsummaryList().finally(function() {
            fetchAcademicsummary(true).finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        });
    };

    $scope.loadMoreAcademicsummary = function(){
        fetchAcademicsummary().finally(function() {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };
});
