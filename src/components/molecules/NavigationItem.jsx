import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const NavigationItem = ({ to, icon, label, badge }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
          isActive
            ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <ApperIcon 
            name={icon} 
            className={`w-5 h-5 mr-3 ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`} 
          />
          <span className="font-medium">{label}</span>
          {badge && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${
                isActive ? "bg-white/20 text-white" : "bg-primary-100 text-primary-600"
              }`}
            >
              {badge}
            </motion.span>
          )}
        </>
      )}
    </NavLink>
  );
};

export default NavigationItem;