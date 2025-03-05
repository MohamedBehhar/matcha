import { motion } from "framer-motion";
import { FaHeartbeat } from "react-icons/fa";
import { useLoadingStore } from "@/store/loadingStore";

const HeartLoader = () => {
  const { isLoading } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.3, 1] }}
      transition={{ duration: 0.5, repeat: Infinity }}
      className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-80 z-50"
    >
      <FaHeartbeat size={100} className="text-red-500" />
    </motion.div>
  );
};

export default HeartLoader;
