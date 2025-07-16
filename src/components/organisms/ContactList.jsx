import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import SearchBar from "@/components/molecules/SearchBar";
import Modal from "@/components/molecules/Modal";
import ContactForm from "@/components/organisms/ContactForm";
import ImportExportModal from "@/components/organisms/ImportExportModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import FormField from "@/components/molecules/FormField";
import { contactService } from "@/services/api/contactService";
import { activityService } from "@/services/api/activityService";
import { toast } from "react-toastify";
const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [selectedContact, setSelectedContact] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
const filtered = contacts.filter(contact =>
        contact.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company_c?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [contacts, searchTerm]);

  const loadContacts = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err) {
      setError("Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact) => {
    setSelectedContact(contact);
    setIsEditModalOpen(true);
  };

  const handleDelete = (contact) => {
    setSelectedContact(contact);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateContact = (updatedContact) => {
    setContacts(prev => 
      prev.map(contact => 
        contact.Id === updatedContact.Id ? updatedContact : contact
      )
    );
    setIsEditModalOpen(false);
    setSelectedContact(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedContact) return;

    try {
      await contactService.delete(selectedContact.Id);
      setContacts(prev => prev.filter(contact => contact.Id !== selectedContact.Id));
      toast.success("Contact deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete contact. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
setSelectedContact(null);
  }
};

const handleLogEmail = (contact) => {
  setSelectedContact(contact);
  setIsEmailModalOpen(true);
};

const handleImport = async (contactsToImport) => {
    try {
      const importedContacts = [];
      for (const contactData of contactsToImport) {
        const imported = await contactService.create(contactData);
        importedContacts.push(imported);
      }
      setContacts(prev => [...prev, ...importedContacts]);
      return importedContacts;
    } catch (error) {
      throw new Error(`Failed to import contacts: ${error.message}`);
    }
  };

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadContacts} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <SearchBar
            onSearch={setSearchTerm}
            placeholder="Search contacts..."
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsImportExportModalOpen(true)}
          >
            <ApperIcon name="Upload" className="w-4 h-4 mr-2" />
            Import/Export
          </Button>
        </div>
      </div>

      {filteredContacts.length === 0 ? (
        <Empty
          icon="Users"
          title="No contacts found"
          description={searchTerm ? "No contacts match your search criteria" : "Start building your network by adding your first contact"}
          actionText="Add Contact"
          onAction={() => window.location.href = "/contacts"}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact, index) => (
            <motion.div
              key={contact.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <ApperIcon name="User" className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
<h3 className="text-lg font-semibold text-gray-900">{contact.Name}</h3>
                      <p className="text-sm text-gray-600">{contact.company_c}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(contact)}
                    >
                      <ApperIcon name="Edit" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contact)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
<div className="flex items-center text-sm text-gray-600">
                    <ApperIcon name="Mail" className="w-4 h-4 mr-2" />
                    {contact.email_c}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ApperIcon name="Phone" className="w-4 h-4 mr-2" />
                    {contact.phone_c}
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
onClick={() => window.location.href = `mailto:${contact.email_c}`}
                  >
                    <ApperIcon name="Mail" className="w-4 h-4 mr-2" />
                    Email
</Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.location.href = `tel:${contact.phone_c}`}
                  >
                    <ApperIcon name="Phone" className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                </div>
                
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleLogEmail(contact)}
                  >
                    <ApperIcon name="Mail" className="w-4 h-4 mr-2" />
                    Log Email
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Contact"
        size="md"
      >
        <ContactForm
          contact={selectedContact}
          onSubmit={handleUpdateContact}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Contact"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
            <ApperIcon name="AlertTriangle" className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Contact</h3>
<p className="text-sm text-gray-500 mb-6">
            Are you sure you want to delete {selectedContact?.Name}? This action cannot be undone.
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

      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
onImport={handleImport}
        contacts={contacts}
      />

      <EmailLogModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        contact={selectedContact}
        onSubmit={async (emailData) => {
          try {
            await activityService.create({
              type: "email",
              description: `Email: ${emailData.subject}`,
              subject_c: emailData.subject,
              body_c: emailData.body,
              attachment_c: emailData.attachment,
              entityId: selectedContact.Id,
              entityType: "contact"
            });
            
            toast.success("Email logged successfully!");
            setIsEmailModalOpen(false);
            setSelectedContact(null);
          } catch (error) {
            toast.error("Failed to log email. Please try again.");
          }
        }}
      />
    </div>
  );
};

const EmailLogModal = ({ isOpen, onClose, contact, onSubmit }) => {
  const [formData, setFormData] = useState({
    subject: "",
    body: "",
    attachment: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.subject?.trim()) {
      newErrors.subject = "Subject is required";
    }
    
    if (!formData.body?.trim()) {
      newErrors.body = "Email body is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ subject: "", body: "", attachment: "" });
      setErrors({});
    } catch (error) {
      console.error("Error logging email:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ subject: "", body: "", attachment: "" });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Log Email - ${contact?.Name}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Subject"
          value={formData.subject}
          onChange={(e) => handleChange("subject", e.target.value)}
          placeholder="Enter email subject"
          error={errors.subject}
          required
        />
        
        <FormField
          label="Body"
          type="textarea"
          value={formData.body}
          onChange={(e) => handleChange("body", e.target.value)}
          placeholder="Enter email body content"
          rows={6}
          error={errors.body}
          required
        />
        
        <FormField
          label="Attachment"
          value={formData.attachment}
          onChange={(e) => handleChange("attachment", e.target.value)}
          placeholder="Enter attachment names or descriptions (optional)"
          error={errors.attachment}
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? "Logging..." : "Log Email"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ContactList;