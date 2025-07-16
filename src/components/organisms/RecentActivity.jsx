import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import { activityService } from "@/services/api/activityService";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [activitiesData, contactsData, dealsData] = await Promise.all([
        activityService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);
      
      // Sort activities by date (newest first)
      const sortedActivities = activitiesData.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ).slice(0, 10); // Show only last 10 activities
      
      setActivities(sortedActivities);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (error) {
      console.error("Failed to load recent activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEntityName = (entityId, entityType) => {
    if (entityType === "contact") {
      const contact = contacts.find(c => c.Id === entityId);
      return contact ? contact.name : "Unknown Contact";
    } else if (entityType === "deal") {
      const deal = deals.find(d => d.Id === entityId);
      return deal ? deal.title : "Unknown Deal";
    }
    return "Unknown";
  };

  const getActivityIcon = (type) => {
    const iconMap = {
      email: "Mail",
      call: "Phone",
      meeting: "Calendar",
      task: "CheckSquare",
      note: "FileText",
      deal: "TrendingUp"
    };
    return iconMap[type] || "Activity";
  };

  const getActivityColor = (type) => {
    const colorMap = {
      email: "info",
      call: "success",
      meeting: "warning",
      task: "primary",
      note: "default",
      deal: "success"
    };
    return colorMap[type] || "default";
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="w-12 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <ApperIcon name="Activity" className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.Id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <ApperIcon 
                    name={getActivityIcon(activity.type)} 
                    className="w-4 h-4 text-white" 
                  />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant={getActivityColor(activity.type)} className="text-xs">
                    {activity.type}
                  </Badge>
                  <span className="text-sm font-medium text-gray-900">
                    {getEntityName(activity.entityId, activity.entityType)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {activity.description}
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(activity.createdAt)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default RecentActivity;