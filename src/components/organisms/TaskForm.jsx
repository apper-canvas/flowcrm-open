import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import Select from "@/components/atoms/Select";
import { taskService } from "@/services/api/taskService";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { toast } from "react-toastify";

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    dueDate: task?.dueDate || "",
    priority: task?.priority || "medium",
    contactId: task?.contactId || "",
    dealId: task?.dealId || ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" }
  ];

  useEffect(() => {
    loadContacts();
    loadDeals();
  }, []);

  const loadContacts = async () => {
    try {
      const contactsData = await contactService.getAll();
      setContacts(contactsData);
    } catch (error) {
      toast.error("Failed to load contacts");
    }
  };

  const loadDeals = async () => {
    try {
      const dealsData = await dealService.getAll();
      setDeals(dealsData);
    } catch (error) {
      toast.error("Failed to load deals");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const taskData = {
        ...formData,
        contactId: formData.contactId ? parseInt(formData.contactId) : null,
        dealId: formData.dealId ? parseInt(formData.dealId) : null,
        completed: task?.completed || false
      };
      
      let result;
      if (task) {
        result = await taskService.update(task.Id, taskData);
        toast.success("Task updated successfully!");
      } else {
        result = await taskService.create(taskData);
        toast.success("Task created successfully!");
      }
      
      onSubmit(result);
    } catch (error) {
      toast.error("Failed to save task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <FormField
        label="Task Title"
        value={formData.title}
        onChange={(e) => handleChange("title", e.target.value)}
        error={errors.title}
        placeholder="Enter task title"
        required
      />

      <FormField
        label="Description"
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
        placeholder="Enter task description"
      />

      <FormField
        label="Due Date"
        type="date"
        value={formData.dueDate}
        onChange={(e) => handleChange("dueDate", e.target.value)}
        error={errors.dueDate}
        required
      />

      <FormField
        label="Priority"
        required
      >
        <Select
          value={formData.priority}
          onChange={(e) => handleChange("priority", e.target.value)}
        >
          {priorities.map(priority => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="Associated Contact"
      >
        <Select
          value={formData.contactId}
          onChange={(e) => handleChange("contactId", e.target.value)}
        >
          <option value="">Select a contact (optional)</option>
          {contacts.map(contact => (
            <option key={contact.Id} value={contact.Id}>
              {contact.name} - {contact.company}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="Associated Deal"
      >
        <Select
          value={formData.dealId}
          onChange={(e) => handleChange("dealId", e.target.value)}
        >
          <option value="">Select a deal (optional)</option>
          {deals.map(deal => (
            <option key={deal.Id} value={deal.Id}>
              {deal.title} - ${deal.value.toLocaleString()}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </motion.form>
  );
};

export default TaskForm;