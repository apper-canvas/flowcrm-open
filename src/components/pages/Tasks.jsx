import { motion } from "framer-motion";
import Layout from "@/components/organisms/Layout";
import TaskList from "@/components/organisms/TaskList";

const Tasks = () => {
  return (
    <Layout title="Tasks">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <TaskList />
      </motion.div>
    </Layout>
  );
};

export default Tasks;