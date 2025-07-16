import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Modal from "@/components/molecules/Modal";
import TaskForm from "@/components/organisms/TaskForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { taskService } from "@/services/api/taskService";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { toast } from "react-toastify";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const priorityColors = {
    low: "info",
    medium: "warning",
    high: "danger"
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = tasks;
    
    if (filter === "completed") {
      filtered = tasks.filter(task => task.completed);
    } else if (filter === "pending") {
      filtered = tasks.filter(task => !task.completed);
    } else if (filter === "overdue") {
      filtered = tasks.filter(task => 
        !task.completed && new Date(task.dueDate) < new Date()
      );
    }
    
    setFilteredTasks(filtered);
  }, [tasks, filter]);

  const loadData = async () => {
    try {
      setError("");
      setLoading(true);
      const [tasksData, contactsData, dealsData] = await Promise.all([
        taskService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);
      setTasks(tasksData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? contact.name : "Unknown";
  };

  const getDealTitle = (dealId) => {
    const deal = deals.find(d => d.Id === dealId);
    return deal ? deal.title : "Unknown";
  };

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = await taskService.toggleComplete(task.Id);
      setTasks(prev => 
        prev.map(t => 
          t.Id === task.Id ? updatedTask : t
        )
      );
      toast.success(updatedTask.completed ? "Task completed!" : "Task reopened!");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleDelete = (task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks(prev => 
      prev.map(task => 
        task.Id === updatedTask.Id ? updatedTask : task
      )
    );
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTask) return;

    try {
      await taskService.delete(selectedTask.Id);
      setTasks(prev => prev.filter(task => task.Id !== selectedTask.Id));
      toast.success("Task deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete task. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedTask(null);
    }
  };

  const isOverdue = (task) => {
    return !task.completed && new Date(task.dueDate) < new Date();
  };

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {["all", "pending", "completed", "overdue"].map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter(filterOption)}
            className="capitalize"
          >
            {filterOption}
          </Button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <Empty
          icon="CheckSquare"
          title="No tasks found"
          description={filter === "all" ? "Start organizing your work by adding your first task" : `No ${filter} tasks found`}
          actionText="Add Task"
          onAction={() => window.location.href = "/tasks"}
        />
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-6 ${task.completed ? 'bg-gray-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleComplete(task)}
                      className={`p-2 ${task.completed ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      <ApperIcon 
                        name={task.completed ? "CheckCircle" : "Circle"} 
                        className="w-5 h-5" 
                      />
                    </Button>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        <Badge variant={priorityColors[task.priority]}>
                          {task.priority}
                        </Badge>
                        {isOverdue(task) && (
                          <Badge variant="danger">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className={`text-sm mb-3 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                        
                        {task.contactId && (
                          <div className="flex items-center">
                            <ApperIcon name="User" className="w-4 h-4 mr-1" />
                            {getContactName(task.contactId)}
                          </div>
                        )}
                        
                        {task.dealId && (
                          <div className="flex items-center">
                            <ApperIcon name="TrendingUp" className="w-4 h-4 mr-1" />
                            {getDealTitle(task.dealId)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(task)}
                    >
                      <ApperIcon name="Edit" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(task)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Task"
        size="md"
      >
        <TaskForm
          task={selectedTask}
          onSubmit={handleUpdateTask}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Task"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
            <ApperIcon name="AlertTriangle" className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Task</h3>
          <p className="text-sm text-gray-500 mb-6">
            Are you sure you want to delete "{selectedTask?.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaskList;