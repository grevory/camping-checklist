angular.module('camping', ['ionic', 'LocalStorageModule'])

.config(function (localStorageServiceProvider) {
   localStorageServiceProvider.setPrefix('camping');
})

// Checklist Model
.factory('ChecklistModel', ['localStorageService', function(localStorageService){
  var _checklist = [],
      _localStorageVar = 'checklist',
      _highestId = 0;

  function loadChecklist() {
    var checklist = localStorageService.get(_localStorageVar);
    getHighestId(checklist);
    // console.log(_highestId, _.pluck(checklist, 'id'));
    return checklist;
  }

  function ChecklistItem(title) {
    this.id = _highestId + 1;
    this.title = title;
    this.completed = false;
  }

  function getHighestId(checklist) {
    if (!checklist)
      checklist = _checklist;
    if (!checklist || !checklist.length){
      _highestId = 0;
    } else {
    _highestId = _.max(_.pluck(checklist, 'id')) || 0;
    }
    return _highestId;
  }

  return {
    
    get: function(query) {
      if (!_checklist || !_checklist.length)
        _checklist = loadChecklist() || [];
      // Get all
      if (!query)
        return _checklist;
      // Get item by ID
      if (_.isNumber(query)) {
        return _.find(_checklist, function(item) {
                  return item.id === query;
                });
      }
      // Get item by title
      return _.find(_checklist, function(item) {
                return item.title === query;
              });
    },

    add: function(title) {
      var newChecklistItem = new ChecklistItem(title);
      _checklist.push(newChecklistItem);
      localStorageService.set(_localStorageVar, _checklist);
      getHighestId();
      return newChecklistItem;
    },

    update: function(id, title, completed) {
      var item = _.find(_checklist, function(item) {
                    return item.id === id;
                  });

      item.title = title;
      item.completed = !!completed;
      console.log(0,_checklist);
      localStorageService.set(_localStorageVar, _checklist);
      return item;
    },

    toggleCompleteness: function(id) {
      var item = _.find(_checklist, function(item) {
                    return item.id === id;
                  });
      return this.update(id, item.title, !item.completed);
    }
  };
}])

.controller('ChecklistCtrl', function($scope, $ionicModal, ChecklistModel) {

  $scope.checklist = ChecklistModel.get();

  // Create our modal
  $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
    $scope.taskModal = modal;
  }, {
    scope: $scope
  });

  $scope.complete = function(id) {
    ChecklistModel.toggleCompleteness(id);
  };

  $scope.createTask = function(task) {
    if(!task) {
      return;
    }

    ChecklistModel.add(task.title);
    $scope.checklist = ChecklistModel.get();

    $scope.taskModal.hide();

    task.title = "";
  };

  $scope.newTask = function() {
    $scope.taskModal.show();
  };

  $scope.closeNewTask = function() {
    $scope.taskModal.hide();
  };
});
