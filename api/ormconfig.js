module.exports =  {
   "type": "mysql",
   "host": "db-mysql-gpmt-do-user-10761257-0.b.db.ondigitalocean.com",
   "port": 25060,
   "username": "doadmin",
   "password": "kKUmGwfEK2AZq1zl",
   "database": "defaultdb",
   "synchronize": true,
   "logging": true,
   "entities": [
      __dirname + "/src/entity/**/*.{ts,js}"
   ],
   "migrations": [
      "src/migration/**/*.js"
   ],
   "subscribers": [
      "src/subscriber/**/*.js"
   ],
   "cli": {
      "entitiesDir": "src/entity",
      "migrationsDir": "src/migration",
      "subscribersDir": "src/subscriber"
   }
}
