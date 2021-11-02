# Car booking project

###Development environment

```
NodeJS: v16.10.0
Postgresql: 10.18
```

###Startup
First of all, you need to install the dependencies

```
npm install
```

Create an `.env` file by copying `.env-example` and fill in the environment variables

Before starting the project, you need to run `migration.js` filling in the data for the database.

```javascript
const pool = new pg.Pool({
  host: 'localhost',
  password: 'qwerty',
  user: 'user',
  database: 'db_name',
});
```

After successful migrations, you can run the project with the command

```
$npm start
```
