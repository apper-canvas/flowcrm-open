import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import Select from "@/components/atoms/Select";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { toast } from "react-toastify";

const DealForm = ({ deal, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: deal?.title || "",
    value: deal?.value || "",
    stage: deal?.stage || "Lead",
    probability: deal?.probability || 25,
    expectedCloseDate: deal?.expectedCloseDate || "",
    contactIds: deal?.contactIds || []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contacts, setContacts] = useState([]);

  const stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed"];

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const contactsData = await contactService.getAll();
      setContacts(contactsData);
    } catch (error) {
      toast.error("Failed to load contacts");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Deal title is required";
    }
    
    if (!formData.value || formData.value <= 0) {
      newErrors.value = "Deal value must be greater than 0";
    }
    
    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = "Expected close date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const dealData = {
        ...formData,
        value: parseFloat(formData.value)
      };
      
      let result;
      if (deal) {
        result = await dealService.update(deal.Id, dealData);
        toast.success("Deal updated successfully!");
      } else {
        result = await dealService.create(dealData);
        toast.success("Deal created successfully!");
      }
      
      onSubmit(result);
    } catch (error) {
      toast.error("Failed to save deal. Please try again.");
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
        label="Deal Title"
        value={formData.title}
        onChange={(e) => handleChange("title", e.target.value)}
        error={errors.title}
        placeholder="Enter deal title"
        required
      />

      <FormField
        label="Deal Value"
        type="number"
        value={formData.value}
        onChange={(e) => handleChange("value", e.target.value)}
        error={errors.value}
        placeholder="Enter deal value"
        required
      />

      <FormField
        label="Stage"
        error={errors.stage}
        required
      >
        <Select
          value={formData.stage}
          onChange={(e) => handleChange("stage", e.target.value)}
        >
          {stages.map(stage => (
            <option key={stage} value={stage}>{stage}</option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="Probability (%)"
        type="number"
        value={formData.probability}
        onChange={(e) => handleChange("probability", parseInt(e.target.value))}
        min="0"
        max="100"
      />

      <FormField
        label="Expected Close Date"
        type="date"
        value={formData.expectedCloseDate}
        onChange={(e) => handleChange("expectedCloseDate", e.target.value)}
        error={errors.expectedCloseDate}
        required
      />

      <FormField
        label="Associated Contacts"
      >
        <Select
          multiple
          value={formData.contactIds}
          onChange={(e) => {
            const selectedIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
            handleChange("contactIds", selectedIds);
          }}
          className="min-h-[100px]"
        >
          {contacts.map(contact => (
            <option key={contact.Id} value={contact.Id}>
              {contact.name} - {contact.company}
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
          {isSubmitting ? "Saving..." : deal ? "Update Deal" : "Create Deal"}
        </Button>
      </div>
    </motion.form>
  );
};

export default DealForm;