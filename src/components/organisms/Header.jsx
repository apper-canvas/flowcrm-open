import { useState, useContext } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import QuickActions from "@/components/molecules/QuickActions";
import { AuthContext } from "../../App";
import { toast } from "react-toastify";
const Header = ({ title, onMobileMenuToggle }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useContext(AuthContext);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    toast.success("Data refreshed successfully!");
  };

  const handleQuickAction = (type, item) => {
    toast.success(`${type} created successfully!`);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileMenuToggle}
            className="lg:hidden mr-4"
          >
            <ApperIcon name="Menu" className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString("en-US", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </p>
          </div>
        </div>

<div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <QuickActions
              onContactCreated={(contact) => handleQuickAction("Contact", contact)}
              onDealCreated={(deal) => handleQuickAction("Deal", deal)}
              onTaskCreated={(task) => handleQuickAction("Task", task)}
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="hidden sm:flex"
          >
            <motion.div
              animate={refreshing ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: refreshing ? Infinity : 0 }}
            >
              <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
            </motion.div>
Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="hidden sm:flex"
          >
            <ApperIcon name="LogOut" className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;