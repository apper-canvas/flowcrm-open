import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Modal from "@/components/molecules/Modal";
import DealForm from "@/components/organisms/DealForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { toast } from "react-toastify";

const DealPipeline = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [draggedDeal, setDraggedDeal] = useState(null);

  const stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError("");
      setLoading(true);
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (err) {
      setError("Failed to load deals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDealsByStage = (stage) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const getContactNames = (contactIds) => {
    return contactIds.map(id => {
      const contact = contacts.find(c => c.Id === id);
      return contact ? contact.name : "Unknown";
    }).join(", ");
  };

  const handleDragStart = (e, deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    
    if (!draggedDeal || draggedDeal.stage === newStage) {
      setDraggedDeal(null);
      return;
    }

    try {
      const updatedDeal = await dealService.updateStage(draggedDeal.Id, newStage);
      setDeals(prev => 
        prev.map(deal => 
          deal.Id === draggedDeal.Id ? { ...deal, stage: newStage } : deal
        )
      );
      toast.success(`Deal moved to ${newStage} stage`);
    } catch (error) {
      toast.error("Failed to update deal stage");
    } finally {
      setDraggedDeal(null);
    }
  };

  const handleEdit = (deal) => {
    setSelectedDeal(deal);
    setIsEditModalOpen(true);
  };

  const handleDelete = (deal) => {
    setSelectedDeal(deal);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateDeal = (updatedDeal) => {
    setDeals(prev => 
      prev.map(deal => 
        deal.Id === updatedDeal.Id ? updatedDeal : deal
      )
    );
    setIsEditModalOpen(false);
    setSelectedDeal(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDeal) return;

    try {
      await dealService.delete(selectedDeal.Id);
      setDeals(prev => prev.filter(deal => deal.Id !== selectedDeal.Id));
      toast.success("Deal deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete deal. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedDeal(null);
    }
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 75) return "success";
    if (probability >= 50) return "warning";
    return "danger";
  };

  const getStageColor = (stage) => {
    const colors = {
      "Lead": "bg-blue-500",
      "Qualified": "bg-yellow-500",
      "Proposal": "bg-purple-500",
      "Negotiation": "bg-orange-500",
      "Closed": "bg-green-500"
    };
    return colors[stage] || "bg-gray-500";
  };

  if (loading) return <Loading type="pipeline" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {deals.length === 0 ? (
        <Empty
          icon="TrendingUp"
          title="No deals found"
          description="Start building your sales pipeline by adding your first deal"
          actionText="Add Deal"
          onAction={() => window.location.href = "/deals"}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {stages.map((stage) => (
            <div
              key={stage}
              className="bg-surface rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getStageColor(stage)} mr-2`}></div>
                  <h3 className="font-semibold text-gray-900">{stage}</h3>
                </div>
                <Badge variant="default">
                  {getDealsByStage(stage).length}
                </Badge>
              </div>

              <div className="space-y-3">
                {getDealsByStage(stage).map((deal, index) => (
                  <motion.div
                    key={deal.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      hover
                      className={`p-4 cursor-move ${draggedDeal?.Id === deal.Id ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm leading-tight">
                          {deal.title}
                        </h4>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(deal)}
                            className="p-1"
                          >
                            <ApperIcon name="Edit" className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(deal)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <ApperIcon name="Trash2" className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-lg font-bold text-primary-600 mb-2">
                        ${deal.value.toLocaleString()}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <Badge variant={getProbabilityColor(deal.probability)}>
                          {deal.probability}%
                        </Badge>
                        <span>{new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                      </div>

                      {deal.contactIds.length > 0 && (
                        <div className="flex items-center text-xs text-gray-600">
                          <ApperIcon name="User" className="w-3 h-3 mr-1" />
                          <span className="truncate">{getContactNames(deal.contactIds)}</span>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Deal"
        size="md"
      >
        <DealForm
          deal={selectedDeal}
          onSubmit={handleUpdateDeal}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Deal"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
            <ApperIcon name="AlertTriangle" className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Deal</h3>
          <p className="text-sm text-gray-500 mb-6">
            Are you sure you want to delete "{selectedDeal?.title}"? This action cannot be undone.
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

export default DealPipeline;