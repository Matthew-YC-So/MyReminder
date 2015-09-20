angular.module('starter.services', ['starter.config'])
// DB Wrapper
.factory('DB', function ($q, DB_CONFIG) {
    var self = this;
    self.db = null;

    self.init = function () {
        // Use self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name}); in production
        self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);

        angular.forEach(DB_CONFIG.tables, function (table) {
            var columns = [];

            angular.forEach(table.columns, function (column) {
                columns.push(column.name + ' ' + column.type);
            });

            //var queryDelete = 'DROP TABLE IF EXISTS ' + table.name;
            //self.query(queryDelete);
            //console.log('Table ' + table.name + ' dropped');

            var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
            self.query(query);
            console.log('Table ' + table.name + ' initialized');
        });
    };

    self.query = function (query, bindings) {
        bindings = typeof bindings !== 'undefined' ? bindings : [];
        var deferred = $q.defer();

        self.db.transaction(function (transaction) {
            transaction.executeSql(query, bindings, function (transaction, result) {
                deferred.resolve(result);
            }, function (transaction, error) {
                deferred.reject(error);
            });
        });

        return deferred.promise;
    };

    self.fetchAll = function (result) {
        var output = [];

        for (var i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
        }

        return output;
    };

    self.fetch = function (result) {
        return result.rows.item(0);
    };

    return self;

})
// Resource service 
.factory('DBGroups', function(DB) {
    var self = this;
    
    self.all = function() {
        return DB.query('SELECT * FROM groups ORDER BY id')
        .then(function (result) {
            return DB.fetchAll(result);
        });
    };

    self.addGroup = function (item) {
        return DB.query('INSERT INTO groups (title) values (?)', [item.title])
        .then(function (result) {
            return result.insertId;
        });
    };
    
    self.deleteGroup = function (item) {
        return DB.query('DELETE FROM groups WHERE id = ?', [item.id])
        .then(function (result) {
            return result;
        });
    };


    self.getById = function (id) {
        return DB.query('SELECT * FROM groups WHERE id = ?', [id])
        .then(function(result){
            return DB.fetch(result);
        });
    };

    self.getByTitle = function (title) {
        return DB.query('SELECT * FROM groups WHERE title = ?', [title])
        .then(function (result) {
            return DB.fetch(result);
        });
    };

    self.getRemindersByGroupId = function (id) {
        return DB.query('SELECT * FROM reminders WHERE groupId = ? ORDER BY id desc', [id])
        .then(function (result) {
            return DB.fetchAll(result);
        });
    };

    self.addReminder = function (item) {
        return DB.query('INSERT INTO reminders (date, content, groupId) values (?,?,?)', [item.date, item.content, item.groupId])
        .then(function (result) {
            return result.insertId;
        });
    };

    self.deleteReminder = function (item) {
        return DB.query('DELETE FROM reminders WHERE id = ?', [item.id]);
    };
    
    return self;
})

.factory('Groups', function (DBGroups) {

    return {

        all: function () {
            return DBGroups.all();
        },

        deleteGroup: function (group) {
            return DBGroups.deleteGroup(group);
        },

        get: function (groupId) {
            for (var i = 0; i < groups.length; i++) {
                if (groupIds[i].id === parseInt(groupId)) {
                    return groups[i];
                }
            }
            return null;
        },

        getLastActiveIndex: function () {
            return parseInt(window.localStorage['lastActiveGroup']) || 0;
        },

        setLastActiveIndex: function (index) {
            window.localStorage['lastActiveGroup'] = index;
        },

        addGroup: function (title) {
            var group = { title: title, reminders: [] };
            return DBGroups.addGroup(group).then(function (id) {
                group.id = id;
                return group;
            });
        },

        getRemindersByGroupId: function (id) {
            return DBGroups.getRemindersByGroupId(id);
        },

        addReminder: function (reminder) {
            return DBGroups.addReminder(reminder).then(function (id) {
                reminder.id = id;
                return reminder;
            });
        },

        deleteReminder: function (reminder) {
            return DBGroups.deleteReminder(reminder);
        },



    }

});
