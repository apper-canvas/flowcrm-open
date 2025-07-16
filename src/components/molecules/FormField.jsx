import React from "react";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";

const FormField = ({ 
  label, 
  error, 
  type = "text", 
  children, 
  required = false,
  ...props 
}) => {
  return (
    <div className="space-y-1">
    <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>})
              {children ? children : type === "select" ? <Select error={error} {...props} /> : type === "textarea" ? <textarea
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${error ? "border-red-500" : "border-gray-300"}`}
            {...props} /> : <Input type={type} error={error} {...props} />}
        {error && <p className="text-sm text-red-600">{error}</p>}
    </Label></div>
  );
};

export default FormField;