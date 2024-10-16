import Schema from "./validation";


const schema =Schema.object({
    PORT: Schema.number().default(3000),
    POSTGRES_URL: Schema.string().default("postgres://postgres:postgres@192.168.1.132:5432/matcha?schema=public"),
    REDIS_URL: Schema.string().default("redis://localhost:6379"),
    JWT_SECRET: Schema.string().default("secret"),
    JWT_EXPIRES_IN: Schema.string().default("1h"),
    REDIS_PORT: Schema.number().default(6379),
})

const env = schema.validate(process.env);

export default env;



