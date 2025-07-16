import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import { contactService } from "@/services/api/contactService";
import { toast } from "react-toastify";

const ContactForm = ({ contact, onSubmit, onCancel }) => {
const [formData, setFormData] = useState({
    name: contact?.Name || "",
    email: contact?.email_c || "",
    phone: contact?.phone_c || "",
    company: contact?.company_c || ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    
    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      let result;
      if (contact) {
        result = await contactService.update(contact.Id, formData);
        toast.success("Contact updated successfully!");
      } else {
        result = await contactService.create(formData);
        toast.success("Contact created successfully!");
      }
      
      onSubmit(result);
    } catch (error) {
      toast.error("Failed to save contact. Please try again.");
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
        label="Full Name"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        error={errors.name}
        placeholder="Enter full name"
        required
      />

      <FormField
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
        error={errors.email}
        placeholder="Enter email address"
        required
      />

      <FormField
        label="Phone Number"
        type="tel"
        value={formData.phone}
        onChange={(e) => handleChange("phone", e.target.value)}
        error={errors.phone}
        placeholder="Enter phone number"
        required
      />

      <FormField
        label="Company"
        value={formData.company}
        onChange={(e) => handleChange("company", e.target.value)}
        error={errors.company}
        placeholder="Enter company name"
        required
      />

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
          {isSubmitting ? "Saving..." : contact ? "Update Contact" : "Create Contact"}
        </Button>
      </div>
    </motion.form>
  );
};

export default ContactForm;