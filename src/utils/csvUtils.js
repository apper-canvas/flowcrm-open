// CSV utility functions for contact import/export
export const csvUtils = {
  // Parse CSV content into array of objects
  parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length !== headers.length) {
        throw new Error(`Row ${i + 1} has ${values.length} columns but expected ${headers.length}`);
      }
      
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      rows.push(row);
    }

    return { headers, rows };
  },

  // Parse individual CSV line handling quoted values
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i - 1] === ',')) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  },

  // Generate CSV content from contact data
  generateCSV(contacts) {
    if (!contacts || contacts.length === 0) {
      throw new Error('No contacts to export');
    }

    const headers = ['Name', 'Email', 'Phone', 'Company', 'Created At', 'Updated At'];
    const csvContent = [
      headers.join(','),
      ...contacts.map(contact => [
        this.escapeCSVValue(contact.name || ''),
        this.escapeCSVValue(contact.email || ''),
        this.escapeCSVValue(contact.phone || ''),
        this.escapeCSVValue(contact.company || ''),
        this.escapeCSVValue(contact.createdAt || ''),
        this.escapeCSVValue(contact.updatedAt || '')
      ].join(','))
    ].join('\n');

    return csvContent;
  },

  // Escape CSV values that contain commas or quotes
  escapeCSVValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    
    return value;
  },

  // Map CSV fields to contact fields
  mapFields(csvHeaders, fieldMapping) {
    const contactFields = ['name', 'email', 'phone', 'company'];
    const mapping = {};
    
    contactFields.forEach(field => {
      if (fieldMapping[field] && csvHeaders.includes(fieldMapping[field])) {
        mapping[field] = fieldMapping[field];
      }
    });
    
    return mapping;
  },

  // Validate contact data
  validateContact(contact, rowIndex) {
    const errors = [];
    
    if (!contact.name || contact.name.trim() === '') {
      errors.push(`Row ${rowIndex + 1}: Name is required`);
    }
    
    if (!contact.email || contact.email.trim() === '') {
      errors.push(`Row ${rowIndex + 1}: Email is required`);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      errors.push(`Row ${rowIndex + 1}: Invalid email format`);
    }
    
if (contact.phone && contact.phone.trim() !== '' && 
        !/^[+]?[\d\s\-()]+$/.test(contact.phone)) {
      errors.push(`Row ${rowIndex + 1}: Invalid phone format`);
    }
    
    return errors;
  },

  // Download CSV file
  downloadCSV(content, filename = 'contacts.csv') {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
};