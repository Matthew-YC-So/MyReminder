angular.module('starter.controllers', [])

//.controller('DashCtrl', function($scope) {})

//.controller('AccountCtrl', function($scope) {
//  $scope.settings = {
//    enableFriends: true
//  };
//})

.controller('RemindersCtrl', function ($scope, Groups, $ionicSideMenuDelegate, $ionicModal, $q) {

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

        if (remindersSelected.length > 0 && confirm('Confirm to delete ' + remindersSelected.length + ' reminder' + (remindersSelected.length > 1 ? 's' : '') + '?')) {
            var proms = [];
            angular.forEach(remindersSelected, function (reminder) {
                proms.push(
                    Groups.deleteReminder(reminder)
                        .then(function () {
                            var index = $scope.activeGroup.reminders.indexOf(reminder)
                            if (index > -1) {
                                $scope.activeGroup.reminders.splice(index, 1);
                            }
                        }));
            });

            // Afte ALL items are removed!
            $q.all(proms).then(function () {
                $scope.remindersSelectModal.hide();
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

    //$scope.reminderSelected = function (reminder) {
    //    this.allRemindersSelected = false;
    //};

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


    // Add Images 
    // 1
    $scope.images = [];

    $scope.addImage = function () {

        //errorHandler = function (err) {
        //    console.log(err);
        //};

        //onInitFs = function (fs) {
        //    console.log('Opened file system: ' + fs.name);
        //};

        //window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        //window.requestFileSystem(window.PERSISTENT, 50 * 1024 * 1024 /*50MB*/, onInitFs, errorHandler);
        //window.webkitStorageInfo.requestQuota(PERSISTENT, 1024 * 1024, function (grantedBytes) {
        //    window.requestFileSystem(window.PERSISTENT, grantedBytes, onInitFs, errorHandler);
        //}, function (e) {
        //    console.log('Error', e);
        //});

        var popover = new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY);
        // 2
        var options = {
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY, // Camera.PictureSourceType.PHOTOLIBRARY  or Camera.PictureSourceType.CAMERA
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG
            // popoverOptions: CameraPopoverOptions,
            // popoverOptions : popover
        };

        // 3
        
        // $cordovaCamera.getPicture(options).then(function (imageData) {
        navigator.camera.getPicture(
            function (imageURI) {

            // 4
                onImageSuccess(imageURI);

            function onImageSuccess(fileURI) {
                createFileEntry(fileURI);
            }

            function createFileEntry(fileURI) {
                window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
            }

            // 5
            function copyFile(fileEntry) {
                var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
                var newName = makeid() + name;
                // window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (fileSystem2) { 
                window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (fileSystem2) {
                    fileEntry.copyTo(
                    fileSystem2,
                    newName,
                    onCopySuccess,
                    fail
                    ); 

                    console.log("got main dir", fileSystem2);
                    fileSystem2.getFile("log.txt", { create: true }, function (file) {
                        console.log("got the file", file);
                        logOb = file;
                        writeLog("App started");
                    });

                },
                fail);
            }

            // 6
            function onCopySuccess(entry) {
                $scope.$apply(function () {
                    $scope.images.push(entry.nativeURL);
                    $scope.reminder.content += '<img src="' +  entry.nativeURL + '" />';
                });
            }

            function fail(error) {
                console.log("fail: " + error.code);
            }

            function makeid() {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i = 0; i < 5; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            }

        }, function (err) {
            console.log(err);
        }, options);
    }


});
