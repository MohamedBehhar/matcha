import Schema from "../lib/validation";

interface visitType {
  user_id: number;
  visited_id: number;
}
const visitType = Schema.object({
  user_id: Schema.string().required(),
  visited_id: Schema.string().required(),
});

const likeType = Schema.object({
  user_id: Schema.number().required(),
  liked_id: Schema.number().required(),
});

const blockType = Schema.object({
  user_id: Schema.number().required(),
  target_id: Schema.number().required(),
});

const checkLikeType = Schema.object({
  user_id: Schema.number().required(),
  target_id: Schema.number().required(),
});

export { visitType, likeType, blockType, checkLikeType };
