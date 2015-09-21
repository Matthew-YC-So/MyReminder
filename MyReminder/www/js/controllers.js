angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('RemindersCtrl', function ($scope, Groups, $ionicSideMenuDelegate, $ionicModal) {

    $scope.allRemindersSelected = false;

    var setActiveGroup = function () {
        // Grab the last active, or the first group
        var lastActiveIndex = Groups.getLastActiveIndex();
        if (lastActiveIndex >= $scope.groups.length)
            lastActiveIndex = $scope.groups.length - 1;

        $scope.activeGroup = $scope.groups[lastActiveIndex];
    };

    Groups.all().then(function (groups) {
        if (groups.length === 0) {
            // Create first default group 
            Groups.addGroup('General').then(function (group) {
                $scope.groups = [group];
                setActiveGroup();
            });
        }
        else {
            $scope.groups = groups;
            setActiveGroup();
        }

    });

    $scope.$watch('activeGroup', function (newValue, oldValue) {
        if (typeof newValue !== 'undefined') {
            Groups.getRemindersByGroupId(newValue.id).then(function (reminders) {
                newValue.reminders = angular.forEach(reminders, function (item) {
                    item.date = new Date(item.date);
                    item.selected = false; // Used for UI selection
                });
            });
            $scope.allRemindersSelected = false;
        }
    });

    // A utility function for creating a new project
    // with the given projectTitle
    var createGroup = function (groupTitle) {
        var newGroup = Groups.addGroup(groupTitle).then(function (group) {
            $scope.groups.push(group);
            $scope.selectGroup(group, $scope.groups.length - 1);
        });
    }

    $scope.newGroup = function () {
        var groupTitle = prompt('Group name');
        if (groupTitle) {
            createGroup(groupTitle);
        }
    };

    $scope.removeGroup = function (group) {
        if (confirm('Confirm to delete group ' + group.title + ' ?')) {
            Groups.deleteGroup(group)
                .then(function () {
                    var index = $scope.groups.indexOf(group)
                    if (index > -1) {
                        $scope.groups.splice(index, 1);
                    }
                });
        }
    };

    $scope.removeSelectedReminders = function () {

        var remindersSelected = [];
        angular.forEach($scope.activeGroup.reminders, function (reminder) {
            if (reminder.selected) {
                remindersSelected.push(reminder);
            };
        });

        if (remindersSelected.length > 0 && confirm('Confirm to delete reminders ?')) {
            angular.forEach(remindersSelected, function (reminder) {
                Groups.deleteReminder(reminder)
                    .then(function () {
                        var index = $scope.activeGroup.reminders.indexOf(reminder)
                        if (index > -1) {
                            $scope.activeGroup.reminders.splice(index, 1);
                        }
                    });
            });
        }
    };

    //$scope.removeReminder = function (reminder) {
    //    $scope.activeGroup.remove(reminder);
    //};

    $scope.editReminder = function (reminder) {
        $scope.reminder = reminder;
        $scope.reminderModal.show();
    };

    $scope.selectGroup = function (group, index) {
        $scope.activeGroup = group;
        Groups.setLastActiveIndex(index);
    };

    $ionicModal.fromTemplateUrl('templates/reminder-detail.html', function (modal) {
        $scope.reminderModal = modal;
    },
     {
         scope: $scope,
         animation: 'slide-in-up'
     });

    $scope.newReminder = function () {
        $scope.reminder = { id: -1, date: new Date(), content: '', groupId: $scope.activeGroup.id };
        $scope.reminderModal.show();
    };

    $scope.closeNewReminder = function () {
        $scope.reminderModal.hide();
    };

    $scope.updateReminder = function (reminder) {
        if (!$scope.activeGroup || reminder.content === '') {
            return;
        }
        if (reminder.id === -1) {
            Groups.addReminder(reminder).then(function (item) {
                $scope.activeGroup.reminders.unshift(item);
            });
        }
        else {
            Groups.updateReminder(reminder);
        }
        $scope.reminderModal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });

    $scope.selectAllReminders = function () {
        var selected = this.allRemindersSelected;
        angular.forEach($scope.activeGroup.reminders, function (item) {
            item.selected = selected;
        });
    }

    $ionicModal.fromTemplateUrl('templates/tab-reminders-select.html', function (modal) {
        $scope.remindersSelectModal = modal;
    },
     {
         scope: $scope,
         animation: 'slide-in-up'
     });

    $scope.openSelectReminders = function () {
        $scope.remindersSelectModal.show();
    };

    $scope.closeSelectReminders = function () {
        $scope.remindersSelectModal.hide();
    };
});
