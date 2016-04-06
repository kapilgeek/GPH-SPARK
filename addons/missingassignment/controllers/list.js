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

//missingassignment

angular.module('mm.addons.missingassignment')

/**
 * Controller to handle missingassignment list.
 *
 * @module mm.addons.missingassignment
 * @ngdoc controller
 * @name mmaMissingassignmentListCtrl
 */
.controller('mmaMissingassignmentListCtrl', function($scope, $mmUtil, $mmaMissingassignment, mmaMissingassignmentListLimit, $sce, $compile, $state) {

    var readCount = 0,
        unreadCount = 0;
    $scope.missingassignment = [];
    $scope.missingassignmentcourse = [];


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

    // Convenience function to get missingassignment. Get unread notifications first.
    function fetchMissingassignment(refresh) {

        if (refresh) {
            readCount = 0;
            unreadCount = 0;
        }


        return $mmaMissingassignment.getMissingassignment(true,unreadCount, mmaMissingassignmentListLimit).then(function(gotSummary) {
            $scope.missingassignment = gotSummary;          
            $scope.missingassignmentcourse = gotSummary.summary['courseData'];
         
            $scope.canLoadMore = false;
        }, function(error) {
                   
                    if (error) {
                        $mmUtil.showErrorModal(error);
                    } else {
                        $mmUtil.showErrorModal('mma.missingassignment.errorgetmissingassignment', true);
                    }
                    $scope.canLoadMore = false;
        });

       
    }
    fetchMissingassignment().finally(function() {
        $scope.missingassignmentLoaded = true;
    });

    $scope.refreshMissingassignment = function() {
        $mmaMissingassignment.invalidateMissingassignmentList().finally(function() {
            fetchMissingassignment(true).finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        });
    };

    $scope.loadMoreMissingassignment = function(){
        fetchMissingassignment().finally(function() {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };
});
