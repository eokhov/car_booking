import pg from 'pg';

const pool = new pg.Pool({
  host: 'tai.db.elephantsql.com',
  password: '8pOlHEq9jrn20NT-Z8w61hjmh63BpnP0',
  user: 'ujgqojyp',
  database: 'ujgqojyp',
});

await pool.query(
  `CREATE TABLE tarif(
    id serial primary key,
    name varchar(255),
    cost integer
  );`,
);

await pool.query(
  `CREATE TABLE car(
    id serial primary key,
    state_number varchar(255),
    tarif_id integer references tarif(id)
  );`,
);

await pool.query(
  `CREATE TABLE discount(
    id serial primary key,
    name varchar(255),
    size integer
  );`,
);

await pool.query(
  `CREATE TABLE discount_plan(
    tarif_id integer references tarif(id),
    discount_id integer references discount(id)
  );`,
);

await pool.query(
  `CREATE TABLE car_session(
    id serial primary key,
    car_id integer references car(id),
    cost_period integer,
    cost integer,
    start_date date,
    finish_date date,
    date_range integer,
    type varchar(30)
  );`,
);

await pool.query(
  `CREATE TABLE booking_stats(
    id serial primary key,
    car_id integer references car(id),
    start_date date,
    finish_date date,
    date_range integer
  );`,
);

await pool.query('INSERT INTO tarif(name, cost) values($1, $2)', [
  'Base',
  1000,
]);

await pool.query('INSERT INTO discount(name, size) values($1, $2)', [
  'Minus 5',
  5,
]);

await pool.query('INSERT INTO discount(name, size) values($1, $2)', [
  'Minus 10',
  10,
]);

await pool.query('INSERT INTO discount(name, size) values($1, $2)', [
  'Minus 15',
  15,
]);

await pool.query('INSERT INTO car(state_number, tarif_id) values($1, $2)', [
  'q123we',
  1,
]);

await pool.query('INSERT INTO car(state_number, tarif_id) values($1, $2)', [
  'a123we',
  1,
]);

await pool.query('INSERT INTO car(state_number, tarif_id) values($1, $2)', [
  'z123we',
  1,
]);

await pool.query('INSERT INTO car(state_number, tarif_id) values($1, $2)', [
  'x123we',
  1,
]);

await pool.query('INSERT INTO car(state_number, tarif_id) values($1, $2)', [
  'e123we',
  1,
]);

await pool.query(
  'INSERT INTO discount_plan(tarif_id, discount_id) values($1, $2)',
  [1, 1],
);

await pool.query(
  'INSERT INTO discount_plan(tarif_id, discount_id) values($1, $2)',
  [1, 2],
);

await pool.query(
  'INSERT INTO discount_plan(tarif_id, discount_id) values($1, $2)',
  [1, 3],
);

pool.end();
