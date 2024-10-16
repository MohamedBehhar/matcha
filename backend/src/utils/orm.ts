import pool from "../db/db";

type QueryFindMany = {
    where?: Record<string, string | number>;
    orderBy?: {
        [key: string]: "ASK" | "DESC";
    },
    limit?: number;
    offset?: number;
}
class OrmMatcha {
    async finMany(table: string, query: QueryFindMany) {
        
        let sql = `SELECT * FROM ${table}`;
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
        return pool.query(sql, values).then((result) => result.rows);
    }

    async findById(table: string, id: number) {
        try{
        return pool.query(`SELECT * FROM ${table} WHERE id = $1 limit 1`, [id]).then((result) => result.rows[0]);
        }
        catch(err){
            throw new Error(`Error finding by id in ${table}: ${err}`);
        }
    }

    async create(table: string, data: Record<string, any>) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, index) => `$${index + 1}`);
        const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
        return pool.query(sql, values).then((result) => result.rows[0]);
    }

    async update(table: string, id: number, data: Record<string, any>) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((key, index) => `${key} = $${index + 1}`);
        const sql = `UPDATE ${table} SET ${placeholders.join(", ")} WHERE id = $${values.length + 1} RETURNING *`;
        const res =  pool.query(sql, [...values, id]).then((result) => result.rows[0]);
        return res;
    }

    async delete(table: string, id: number) {
        return pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    }

    async deleteAll(table: string) {
        return pool.query(`
            DELETE FROM ${table}
            WHERE true
        `);
    }
}




export default new OrmMatcha();