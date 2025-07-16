import { useState } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Modal from "@/components/molecules/Modal";
import ContactForm from "@/components/organisms/ContactForm";
import DealForm from "@/components/organisms/DealForm";
import TaskForm from "@/components/organisms/TaskForm";

const QuickActions = ({ onContactCreated, onDealCreated, onTaskCreated }) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const actions = [
    {
      icon: "UserPlus",
      label: "Add Contact",
      onClick: () => setIsContactModalOpen(true),
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: "Plus",
      label: "Add Deal",
      onClick: () => setIsDealModalOpen(true),
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: "CheckSquare",
      label: "Add Task",
      onClick: () => setIsTaskModalOpen(true),
      gradient: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button
            onClick={action.onClick}
            variant="primary"
            size="sm"
            className={`bg-gradient-to-r ${action.gradient} hover:shadow-lg`}
          >
            <ApperIcon name={action.icon} className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        </motion.div>
      ))}

      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Add New Contact"
        size="md"
      >
        <ContactForm
          onSubmit={(contact) => {
            onContactCreated(contact);
            setIsContactModalOpen(false);
          }}
          onCancel={() => setIsContactModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        title="Add New Deal"
        size="md"
      >
        <DealForm
          onSubmit={(deal) => {
            onDealCreated(deal);
            setIsDealModalOpen(false);
          }}
          onCancel={() => setIsDealModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add New Task"
        size="md"
      >
        <TaskForm
          onSubmit={(task) => {
            onTaskCreated(task);
            setIsTaskModalOpen(false);
          }}
          onCancel={() => setIsTaskModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default QuickActions;