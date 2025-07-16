import { motion } from "framer-motion";
import Layout from "@/components/organisms/Layout";
import DealPipeline from "@/components/organisms/DealPipeline";

const Deals = () => {
  return (
    <Layout title="Deals Pipeline">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DealPipeline />
      </motion.div>
    </Layout>
  );
};

export default Deals;