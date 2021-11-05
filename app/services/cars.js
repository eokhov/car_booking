import db from '../../db.js';
import { addDays } from '../../lib.js';

class Car {
  static getAll() {
    return db.query('SELECT * FROM car');
  }

  static check({ start_date, finish_date, car_id }) {
    const sql = `
      SELECT * FROM car_session cs
      WHERE (
        $1 between cs.start_date and cs.finish_date
        OR
        $2 between cs.start_date and cs.finish_date
      ) AND cs.car_id=$3 LIMIT 1`;
    return db.query(sql, [start_date, finish_date, car_id]);
  }

  static calculationCost(car_id) {
    const sql = `
      SELECT c.id, t.cost, d.size AS discount_size 
      FROM car c LEFT JOIN tarif t ON t.id=c.tarif_id 
      LEFT JOIN discount_plan dp ON dp.tarif_id=c.tarif_id 
      LEFT JOIN discount d ON d.id=dp.discount_id WHERE c.id=$1;`;
    return db.query(sql, [car_id]);
  }

  static async createCarSession({
    car_id,
    cost_period,
    cost,
    start_date,
    finish_date,
    date_range,
    booking_dates,
  }) {
    const createSessionSql = `INSERT INTO car_session
      (car_id, cost_period, cost, start_date, finish_date, date_range, type)
      values($1, $2, $3, $4, $5, $6, $7)`;
    const createBookingSql = `INSERT INTO booking_stats
      (car_id, start_date, finish_date, date_range)
      values($1, $2, $3, $4)`;
    try {
      await db.query('BEGIN');
      await db.query(createSessionSql, [
        car_id,
        cost_period,
        cost,
        start_date,
        finish_date,
        date_range,
        'booking',
      ]);
      await db.query(createSessionSql, [
        car_id,
        0,
        0,
        addDays(finish_date, 1),
        addDays(finish_date, 3),
        3,
        'serice',
      ]);
      for (const dates of booking_dates) {
        await db.query(createBookingSql, [
          car_id,
          dates.firstDate,
          dates.lastDate,
          dates.range,
        ]);
      }
      await db.query('COMMIT');
      return { create: 'OK' };
    } catch (error) {
      return error;
    }
  }

  static getCarStatsByCar(car_id, first_day, last_day, count_days) {
    const sql = `SELECT c.id AS car_id, c.state_number, 
      CEIL(SUM(date_range)::decimal / $1 * 100) AS usage_percent
      FROM car c LEFT JOIN booking_stats bs 
      ON bs.car_id = c.id WHERE c.id=$2 
      AND bs.start_date >= $3 AND bs.finish_date <= $4 GROUP BY c.id;`;
    return db.query(sql, [count_days, car_id, first_day, last_day]);
  }

  static getCarStats(first_day, last_day, count_days) {
    console.log();
    const sql = `SELECT c.id AS car_id, c.state_number, 
      CEIL(SUM(date_range)::decimal / $1 * 100) AS usage_percent
      FROM car c LEFT JOIN booking_stats bs 
      ON bs.car_id = c.id  
      AND bs.start_date >= $2 AND bs.finish_date <= $3 GROUP BY c.id;`;
    return db.query(sql, [count_days, first_day, last_day]);
  }
}

export { Car };
