import { motion } from "framer-motion";
import Layout from "@/components/organisms/Layout";
import DashboardStats from "@/components/organisms/DashboardStats";
import RecentActivity from "@/components/organisms/RecentActivity";
import UpcomingTasks from "@/components/organisms/UpcomingTasks";

const Dashboard = () => {
  return (
    <Layout title="Dashboard">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentActivity />
          <UpcomingTasks />
        </div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;