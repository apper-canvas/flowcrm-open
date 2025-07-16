import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { taskService } from "@/services/api/taskService";

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalDeals: 0,
    totalValue: 0,
    totalContacts: 0,
    pendingTasks: 0,
    completedTasks: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [deals, contacts, tasks] = await Promise.all([
        dealService.getAll(),
        contactService.getAll(),
        taskService.getAll()
      ]);

const totalDeals = deals.length;
      const totalValue = deals.reduce((sum, deal) => sum + (deal.value_c || 0), 0);
      const closedDeals = deals.filter(deal => deal.stage_c === "Closed").length;
      const conversionRate = totalDeals > 0 ? (closedDeals / totalDeals) * 100 : 0;
const pendingTasks = tasks.filter(task => !task.completed_c).length;
      const completedTasks = tasks.filter(task => task.completed_c).length;

      setStats({
        totalDeals,
        totalValue,
        totalContacts: contacts.length,
        pendingTasks,
        completedTasks,
        conversionRate
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Deals",
      value: stats.totalDeals,
      icon: "TrendingUp",
      color: "from-blue-500 to-blue-600",
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Pipeline Value",
      value: `$${stats.totalValue.toLocaleString()}`,
      icon: "DollarSign",
      color: "from-green-500 to-green-600",
      change: "+8%",
      changeType: "positive"
    },
    {
      title: "Total Contacts",
      value: stats.totalContacts,
      icon: "Users",
      color: "from-purple-500 to-purple-600",
      change: "+5%",
      changeType: "positive"
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      icon: "Clock",
      color: "from-orange-500 to-orange-600",
      change: "-3%",
      changeType: "negative"
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      icon: "CheckCircle",
      color: "from-teal-500 to-teal-600",
      change: "+15%",
      changeType: "positive"
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: "Target",
      color: "from-pink-500 to-pink-600",
      change: "+2%",
      changeType: "positive"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="w-20 h-8 bg-gray-200 rounded mb-2"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card hover className="p-6 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                <ApperIcon name={stat.icon} className="w-6 h-6 text-white" />
              </div>
              <div className={`text-sm font-medium ${
                stat.changeType === "positive" ? "text-green-600" : "text-red-600"
              }`}>
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">
              {stat.title}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;