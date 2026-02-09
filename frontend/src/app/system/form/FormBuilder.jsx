import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

const FormBuilder = ({ form, indicators, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    formName: form?.formName || '',
    formCode: form?.formCode || '',
    version: form?.version || '1.0',
    sections: form?.sections || [],
  });

  const [newSection, setNewSection] = useState({
    sectionName: '',
    displayOrder: 1,
    fields: [],
  });

  const handleAddSection = () => {
    if (newSection.sectionName) {
      setFormData({
        ...formData,
        sections: [...formData.sections, { ...newSection, id: Date.now() }],
      });
      setNewSection({ sectionName: '', displayOrder: 1, fields: [] });
    }
  };

  const handleRemoveSection = (sectionId) => {
    setFormData({
      ...formData,
      sections: formData.sections.filter(s => s.id !== sectionId),
    });
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Form Builder</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Form Name</label>
          <input
            type="text"
            value={formData.formName}
            onChange={(e) => setFormData({ ...formData, formName: e.target.value })}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter form name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Form Code</label>
            <input
              type="text"
              value={formData.formCode}
              onChange={(e) => setFormData({ ...formData, formCode: e.target.value })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="FORM001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Version</label>
            <input
              type="text"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="1.0"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Form Sections</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Section Name</label>
            <input
              type="text"
              value={newSection.sectionName}
              onChange={(e) => setNewSection({ ...newSection, sectionName: e.target.value })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter section name"
            />
          </div>
          <button
            onClick={handleAddSection}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Section
          </button>
        </div>

        <div className="space-y-2">
          {formData.sections.map((section) => (
            <div key={section.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{section.sectionName}</p>
                <p className="text-sm text-gray-600">{section.fields?.length || 0} fields</p>
              </div>
              <button
                onClick={() => handleRemoveSection(section.id)}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
