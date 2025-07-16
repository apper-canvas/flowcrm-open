import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import { taskService } from "@/services/api/taskService";
import { contactService } from "@/services/api/contactService";
import { toast } from "react-toastify";

const UpcomingTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, contactsData] = await Promise.all([
        taskService.getAll(),
        contactService.getAll()
      ]);
      
      // Filter and sort upcoming tasks
      const upcomingTasks = tasksData
        .filter(task => !task.completed)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 8);
      
      setTasks(upcomingTasks);
      setContacts(contactsData);
    } catch (error) {
      console.error("Failed to load upcoming tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? contact.name : null;
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const isDueToday = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due.toDateString() === today.toDateString();
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await taskService.toggleComplete(taskId);
      setTasks(prev => prev.filter(task => task.Id !== taskId));
      toast.success("Task completed!");
    } catch (error) {
      toast.error("Failed to complete task");
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "info",
      medium: "warning",
      high: "danger"
    };
    return colors[priority] || "default";
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = "/tasks"}
        >
          View All
        </Button>
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <ApperIcon name="CheckCircle" className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <p className="text-gray-500">All caught up! No pending tasks.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <motion.div
              key={task.Id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                isOverdue(task.dueDate) ? 'border-red-200 bg-red-50' :
                isDueToday(task.dueDate) ? 'border-yellow-200 bg-yellow-50' :
                'border-gray-200 bg-white'
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCompleteTask(task.Id)}
                className="p-1 text-gray-400 hover:text-green-600"
              >
                <ApperIcon name="Circle" className="w-4 h-4" />
              </Button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </h4>
                  <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                    {task.priority}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <ApperIcon name="Calendar" className="w-3 h-3" />
                  <span>
                    {isOverdue(task.dueDate) ? "Overdue" :
                     isDueToday(task.dueDate) ? "Due today" :
                     new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  
                  {task.contactId && (
                    <>
                      <span>•</span>
                      <ApperIcon name="User" className="w-3 h-3" />
                      <span>{getContactName(task.contactId)}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default UpcomingTasks;