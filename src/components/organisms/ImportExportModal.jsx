import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Modal from '@/components/molecules/Modal';
import Select from '@/components/atoms/Select';
import { csvUtils } from '@/utils/csvUtils';
import { toast } from 'react-toastify';

const ImportExportModal = ({ isOpen, onClose, onImport, onExport, contacts }) => {
  const [mode, setMode] = useState('import'); // 'import' or 'export'
  const [step, setStep] = useState(1); // 1: file selection, 2: field mapping, 3: preview
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const contactFields = [
    { value: 'name', label: 'Name *' },
    { value: 'email', label: 'Email *' },
    { value: 'phone', label: 'Phone' },
    { value: 'company', label: 'Company' }
  ];

  const handleClose = () => {
    setMode('import');
    setStep(1);
    setCsvFile(null);
    setCsvData(null);
    setFieldMapping({});
    setLoading(false);
    setErrors([]);
    onClose();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsedData = csvUtils.parseCSV(content);
        setCsvData(parsedData);
        setStep(2);
        
        // Auto-map fields if possible
        const autoMapping = {};
        parsedData.headers.forEach(header => {
          const normalizedHeader = header.toLowerCase().trim();
          if (normalizedHeader.includes('name')) autoMapping.name = header;
          if (normalizedHeader.includes('email')) autoMapping.email = header;
          if (normalizedHeader.includes('phone')) autoMapping.phone = header;
          if (normalizedHeader.includes('company')) autoMapping.company = header;
        });
        setFieldMapping(autoMapping);
      } catch (error) {
        toast.error(`Error parsing CSV: ${error.message}`);
      }
    };
    
    reader.readAsText(file);
  };

  const handleFieldMappingChange = (contactField, csvField) => {
    setFieldMapping(prev => ({
      ...prev,
      [contactField]: csvField
    }));
  };

  const handlePreview = () => {
    if (!fieldMapping.name || !fieldMapping.email) {
      toast.error('Name and Email fields are required');
      return;
    }

    const mapping = csvUtils.mapFields(csvData.headers, fieldMapping);
    const previewData = csvData.rows.slice(0, 5).map((row, index) => {
      const contact = {};
      Object.keys(mapping).forEach(field => {
        contact[field] = row[mapping[field]] || '';
      });
      return contact;
    });

    // Validate preview data
    const validationErrors = [];
    previewData.forEach((contact, index) => {
      const contactErrors = csvUtils.validateContact(contact, index);
      validationErrors.push(...contactErrors);
    });

    setErrors(validationErrors);
    setStep(3);
  };

  const handleImport = async () => {
    if (!csvData || !fieldMapping.name || !fieldMapping.email) {
      toast.error('Please complete the field mapping');
      return;
    }

    setLoading(true);
    try {
      const mapping = csvUtils.mapFields(csvData.headers, fieldMapping);
      const contactsToImport = csvData.rows.map(row => {
        const contact = {};
        Object.keys(mapping).forEach(field => {
          contact[field] = row[mapping[field]] || '';
        });
        return contact;
      });

      // Validate all contacts
      const allErrors = [];
      contactsToImport.forEach((contact, index) => {
        const contactErrors = csvUtils.validateContact(contact, index);
        allErrors.push(...contactErrors);
      });

      if (allErrors.length > 0) {
        setErrors(allErrors);
        toast.error(`Found ${allErrors.length} validation errors`);
        return;
      }

      await onImport(contactsToImport);
      toast.success(`Successfully imported ${contactsToImport.length} contacts`);
      handleClose();
    } catch (error) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!contacts || contacts.length === 0) {
      toast.error('No contacts to export');
      return;
    }

    setLoading(true);
    try {
      const csvContent = csvUtils.generateCSV(contacts);
      const timestamp = new Date().toISOString().split('T')[0];
      csvUtils.downloadCSV(csvContent, `contacts_${timestamp}.csv`);
      toast.success(`Exported ${contacts.length} contacts successfully`);
      handleClose();
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderImportStep1 = () => (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
        <ApperIcon name="Upload" className="w-8 h-8 text-primary-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h3>
      <p className="text-sm text-gray-500 mb-6">
        Select a CSV file containing your contact data
      </p>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          className="mb-2"
        >
          <ApperIcon name="Upload" className="w-4 h-4 mr-2" />
          Choose CSV File
        </Button>
        <p className="text-xs text-gray-500">
          Supported format: CSV files with headers
        </p>
      </div>
    </div>
  );

  const renderImportStep2 = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Map Fields</h3>
        <p className="text-sm text-gray-500">
          Match your CSV columns to contact fields
        </p>
      </div>
      
      <div className="space-y-4">
        {contactFields.map(field => (
          <div key={field.value} className="flex items-center space-x-3">
            <label className="w-24 text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <Select
              value={fieldMapping[field.value] || ''}
              onChange={(value) => handleFieldMappingChange(field.value, value)}
              className="flex-1"
            >
              <option value="">Select CSV column</option>
              {csvData.headers.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </Select>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button onClick={handlePreview}>
          Preview
        </Button>
      </div>
    </div>
  );

  const renderImportStep3 = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Preview & Import</h3>
        <p className="text-sm text-gray-500">
          Review the mapped data before importing
        </p>
      </div>
      
      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <ApperIcon name="AlertCircle" className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-sm font-medium text-red-800">
              Validation Errors ({errors.length})
            </span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.slice(0, 5).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
            {errors.length > 5 && (
              <li>... and {errors.length - 5} more errors</li>
            )}
          </ul>
        </div>
      )}
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <span className="text-sm font-medium text-gray-700">
            Preview (first 5 rows)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Company</th>
              </tr>
            </thead>
            <tbody>
              {csvData.rows.slice(0, 5).map((row, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{row[fieldMapping.name] || '-'}</td>
                  <td className="px-4 py-2">{row[fieldMapping.email] || '-'}</td>
                  <td className="px-4 py-2">{row[fieldMapping.phone] || '-'}</td>
                  <td className="px-4 py-2">{row[fieldMapping.company] || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button 
          onClick={handleImport} 
          disabled={loading || errors.length > 0}
        >
          {loading ? 'Importing...' : `Import ${csvData.rows.length} Contacts`}
        </Button>
      </div>
    </div>
  );

  const renderExportMode = () => (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-accent-100 mb-4">
        <ApperIcon name="Download" className="w-8 h-8 text-accent-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Export Contacts</h3>
      <p className="text-sm text-gray-500 mb-6">
        Download all your contacts as a CSV file
      </p>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="text-sm text-gray-700">
          <div className="flex justify-between mb-2">
            <span>Total Contacts:</span>
            <span className="font-medium">{contacts?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>File Format:</span>
            <span className="font-medium">CSV</span>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleExport} 
        disabled={loading || !contacts?.length}
        className="w-full"
      >
        {loading ? 'Exporting...' : 'Download CSV'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'import' ? 'Import Contacts' : 'Export Contacts'}
      size="lg"
    >
      <div className="mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMode('import')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'import'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Import
          </button>
          <button
            onClick={() => setMode('export')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'export'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Export
          </button>
        </div>
      </div>
      
      {mode === 'import' ? (
        <>
          {step === 1 && renderImportStep1()}
          {step === 2 && renderImportStep2()}
          {step === 3 && renderImportStep3()}
        </>
      ) : (
        renderExportMode()
      )}
    </Modal>
  );
};

export default ImportExportModal;