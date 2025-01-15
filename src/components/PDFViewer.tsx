import React, { useState, useEffect, useRef } from 'react';
    import { Document, Page, pdfjs } from 'react-pdf';
    import { PDFTemplate, PDFField } from '../types';
    import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
    import { Pencil, Trash2, Plus } from 'lucide-react';
    import toast from 'react-hot-toast';
    import { supabase } from '../lib/supabase';

    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

    interface PDFViewerProps {
      template: PDFTemplate;
    }

    export function PDFViewer({ template }: PDFViewerProps) {
      const [numPages, setNumPages] = useState(0);
      const [pageNumber, setPageNumber] = useState(1);
      const [fields, setFields] = useState<PDFField[]>([]);
      const [selectedField, setSelectedField] = useState<PDFField | null>(null);
      const [isEditing, setIsEditing] = useState(false);
      const containerRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        loadFields();
      }, [template.id]);

      const loadFields = async () => {
        try {
          const { data, error } = await supabase
            .from('pdf_fields')
            .select('*')
            .eq('template_id', template.id);

          if (error) throw error;
          setFields(data || []);
        } catch (error: any) {
          toast.error(error.message);
        }
      };

      const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
      };

      const handlePageChange = (newPage: number) => {
        setPageNumber(newPage);
      };

      const handleAddField = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newField: PDFField = {
          id: Math.random().toString(36).substring(2, 15),
          template_id: template.id,
          name: 'New Field',
          type: 'editable',
          x: x,
          y: y,
          width: 100,
          height: 20,
          page: pageNumber,
        };
        setFields([...fields, newField]);
        setSelectedField(newField);
        setIsEditing(true);
      };

      const handleFieldClick = (field: PDFField) => {
        setSelectedField(field);
        setIsEditing(true);
      };

      const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, fieldId: string, key: keyof PDFField) => {
        setFields(fields.map(field => {
          if (field.id === fieldId) {
            return { ...field, [key]: e.target.value };
          }
          return field;
        }));
      };

      const handleFieldDelete = (fieldId: string) => {
        setFields(fields.filter(field => field.id !== fieldId));
        setSelectedField(null);
        setIsEditing(false);
      };

      const handleSaveFields = async () => {
        setIsUploading(true);
        try {
          // Delete existing fields
          const { error: deleteError } = await supabase
            .from('pdf_fields')
            .delete()
            .eq('template_id', template.id);

          if (deleteError) throw deleteError;

          // Insert new fields
          const { error: insertError } = await supabase
            .from('pdf_fields')
            .insert(fields.map(field => ({
              ...field,
              template_id: template.id,
              id: undefined
            })));

          if (insertError) throw insertError;

          toast.success('Fields saved successfully');
        } catch (error: any) {
          toast.error(error.message);
        } finally {
          setIsUploading(false);
        }
      };

      return (
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-3/4 relative">
            <div
              ref={containerRef}
              className="relative border border-gray-300 rounded-md overflow-hidden"
              onClick={handleAddField}
            >
              <Document file={template.file_url} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={pageNumber} />
              </Document>
              {fields.map((field) => (
                <div
                  key={field.id}
                  onClick={() => handleFieldClick(field)}
                  className={`absolute border border-blue-500 rounded-md cursor-pointer transition-all duration-200 ${
                    selectedField?.id === field.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    left: field.x,
                    top: field.y,
                    width: field.width,
                    height: field.height,
                    pointerEvents: 'auto',
                  }}
                >
                  {selectedField?.id === field.id && isEditing && (
                    <div className="absolute top-0 left-0 bg-white p-2 border border-blue-500 rounded-md shadow-md z-10">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-700">Edit Field</h4>
                        <button
                          onClick={() => handleFieldDelete(field.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs text-gray-600">Name</label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => handleFieldChange(e, field.id, 'name')}
                          className="w-full text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <label className="block text-xs text-gray-600">Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => handleFieldChange(e, field.id, 'type')}
                          className="w-full text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="editable">Editable</option>
                          <option value="prefilled">Prefilled</option>
                        </select>
                        <label className="block text-xs text-gray-600">X</label>
                        <input
                          type="number"
                          value={field.x}
                          onChange={(e) => handleFieldChange(e, field.id, 'x')}
                          className="w-full text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <label className="block text-xs text-gray-600">Y</label>
                        <input
                          type="number"
                          value={field.y}
                          onChange={(e) => handleFieldChange(e, field.id, 'y')}
                          className="w-full text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <label className="block text-xs text-gray-600">Width</label>
                        <input
                          type="number"
                          value={field.width}
                          onChange={(e) => handleFieldChange(e, field.id, 'width')}
                          className="w-full text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <label className="block text-xs text-gray-600">Height</label>
                        <input
                          type="number"
                          value={field.height}
                          onChange={(e) => handleFieldChange(e, field.id, 'height')}
                          className="w-full text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <label className="block text-xs text-gray-600">Page</label>
                        <input
                          type="number"
                          value={field.page}
                          onChange={(e) => handleFieldChange(e, field.id, 'page')}
                          className="w-full text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => handlePageChange(pageNumber - 1)}
                disabled={pageNumber <= 1}
                className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="mx-4 text-gray-600">
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={() => handlePageChange(pageNumber + 1)}
                disabled={pageNumber >= numPages}
                className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
          <div className="lg:w-1/4 p-4">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleSaveFields}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Fields
              </button>
            </div>
            <div className="bg-white rounded-md shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Instructions
              </h3>
              <p className="text-sm text-gray-600">
                Click on the PDF to add a new field. Click on a field to edit it.
              </p>
            </div>
          </div>
        </div>
      );
    }
