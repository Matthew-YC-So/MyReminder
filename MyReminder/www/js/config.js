angular.module('starter.config', [])
    .constant('DB_CONFIG', {
        name: 'DB',
        tables: [
          {
              name: 'groups',
              columns: [
                      { name: 'id', type: 'integer primary key' },
                      { name: 'title', type: 'text' }
              ]
          },
          {
              name: 'reminders',
              columns: [
                      { name: 'id', type: 'integer primary key' },
                      { name: 'content', type: 'text' },
                      { name: 'date', type: 'text' },
                      { name: 'groupId', type: 'integer' }
              ]
          }
        ]
    });