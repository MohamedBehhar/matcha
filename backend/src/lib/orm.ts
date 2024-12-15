import { stat } from "fs";
import pool from "../db/db";
import { BadRequestError, NotFoundError } from "./customError";

type QueryFindMany = {
  where?: Record<string, string | number>;
  orderBy?: {
    [key: string]: "ASK" | "DESC";
  };
  limit?: number;
  offset?: number;
  select?: string[];
};

type QueryFindOne = {
  where?: Record<string, string | number>;
};
class OrmMatcha {
  async findMany(table: string, query: QueryFindMany) {
    try {
      if (!query.select) {
        query.select = ["*"];
      }
      let sql = `SELECT ${query.select.join(", ")} FROM ${table}`;
      let values: any[] = [];
      if (query.where) {
        const where = Object.keys(query.where).map((key, index) => {
          values.push(query.where![key]);
          return `${key} = $${index + 1}`;
        });
        sql += ` WHERE ${where.join(" AND ")}`;
      }
      if (query.orderBy) {
        const orderBy = Object.keys(query.orderBy).map((key) => {
          return `${key} ${query.orderBy![key]}`;
        });
        sql += ` ORDER BY ${orderBy.join(", ")}`;
      }
      if (query.limit) {
        sql += ` LIMIT ${query.limit}`;
      }
      if (query.offset) {
        sql += ` OFFSET ${query.offset}`;
      }
      const data =
        (await pool.query(sql, values).then((result) => result.rows)) || [];
      return data;
    } catch (err) {
      throw new Error(`Error finding many in ${table}: ${err}`);
    }
  }

  async findById(table: string, id: number | string) {
    try {
      const data = await pool
        .query(`SELECT * FROM ${table} WHERE id = $1 limit 1`, [id])
        .then((result) => result.rows[0]);
      return data;
    } catch (err) {
      throw new Error(`Error finding by id in ${table}: ${err}`);
    }
  }

  async create(table: string, data: Record<string, any>) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, index) => `$${index + 1}`);
      const sql = `INSERT INTO ${table} (${keys.join(
        ", "
      )}) VALUES (${placeholders.join(", ")}) RETURNING *`;
      const res = await pool
        .query(sql, values)
        .then((result) => result.rows[0]);
      return res;
    } catch (err) {
      throw new BadRequestError(`Error creating in ${table}: ${err}`);
    }
  }

  async update(table: string, id: string | number, data: Record<string, any>) {
    try {
      const reccord = await this.findById(table, id);
      if (!reccord) {
        throw new NotFoundError(`No record found with id ${id} in ${table}`);
      }
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((key, index) => `${key} = $${index + 1}`);
      const sql = `UPDATE ${table} SET ${placeholders.join(", ")} WHERE id = $${
        values.length + 1
      } RETURNING *`;
      const res = await pool
        .query(sql, [...values, id])
        .then((result) => result.rows[0]);
      return res;
    } catch (err) {
      throw new Error(`Error updating in ${table}: ${err}`);
    }
  }

  async delete(table: string, id: number | string) {
    try {
      const reccord = await this.findById(table, id);
      if (!reccord) {
        throw new NotFoundError(`No record found with id ${id} in ${table}`);
      }
      await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
      return reccord;
    } catch (err) {
      throw new Error(`Error deleting in ${table}: ${err}`);
    }
  }
  async findOne(table: string, query: QueryFindOne) {
    try {
      let sql = `SELECT * FROM ${table}`;
      let values: any[] = [];
      if (query.where) {
        const where = Object.keys(query.where).map((key, index) => {
          values.push(query.where![key]);
          return `${key} = $${index + 1}`;
        });
        sql += ` WHERE ${where.join(" AND ")}`;
      }
      const data = await pool
        .query(sql, values)
        .then((result) => result.rows[0]);
      return data;
    } catch (err) {
      throw new Error(`Error finding one in ${table}: ${err}`);
    }
  }

  async deleteAll(table: string) {
    try {
      return pool.query(`
            DELETE FROM ${table}
            WHERE true
            `);
    } catch (err) {
      throw new Error(`Error deleting all in ${table}: ${err}`);
    }
  }
  async querySql(sql: string, values: any[]) {
    try {
      return pool.query(
        sql,
        values
      ).then((result) => result.rows);
    } catch (err) {
      throw new Error(`Error querying sql: ${err}`);
    }
  }
}

export default new OrmMatcha();
