import userImg from "@/assets/images/user.png";
import UserCard from "../userCard";

function index({ data }: { data: [] }) {
  return (
    <div className="grid min-h-screen   place-items-center ">
      {data.map((item) => (
        <UserCard user={item} />
      ))}
    </div>
  );
}

export default index;
