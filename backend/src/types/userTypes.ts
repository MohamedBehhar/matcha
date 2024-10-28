import Schema from "../lib/validation";


const createUserDto =  Schema.object({
    email: Schema.string().email().required(),
    password: Schema.string().min(6).required(),
    first_name: Schema.string().required(),
    last_name: Schema.string().required(),
    username: Schema.string().required(),
});

const updateUserDto = Schema.object({
    profile_picture: Schema.string().optional(),
    email: Schema.string().email().optional(),
    first_name: Schema.string().optional(),
    last_name: Schema.string().optional(),
    username: Schema.string().optional(),
    bio: Schema.string().optional(),
    gender : Schema.string().optional(),
    sexual_preference: Schema.string().optional(),
});

export { createUserDto, updateUserDto };