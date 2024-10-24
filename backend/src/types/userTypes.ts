import Schema from "../lib/validation";


const createUserDto =  Schema.object({
    email: Schema.string().email().required(),
    password: Schema.string().min(6).required(),
    first_name: Schema.string().required(),
    last_name: Schema.string().required(),
    // phone_number: Schema.string().required(),
    username: Schema.string().required(),
});

const updateUserDto = Schema.object({
    email: Schema.string().email().optional(),
    password: Schema.string().min(6).optional(),
    first_name: Schema.string().optional(),
    last_name: Schema.string().optional(),
    phone_number: Schema.string().optional(),
    username: Schema.string().optional(),
});

export { createUserDto, updateUserDto };