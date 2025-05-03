import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getForm, createForm, updateForm } from '../../api/formsApi';
import { showToast } from '../../api/apiClient';
import PageHeader from '../../components/common/PageHeader';
import FormBuilder from '../../components/forms/FormBuilder.jsx';
import { FiSave } from 'react-icons/fi';

const FormEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        schema: [],
        validation_rules: {},
        store_submissions: true,
        send_notifications: false,
        notification_emails: '',
        notification_template: '',
        enable_captcha: false,
        is_active: true,
    });

    useEffect(() => {
        if (isEditMode) {
            fetchForm();
        }
    }, [id]);

    const fetchForm = async () => {
        setLoading(true);
        try {
            const response = await getForm(id);
            setFormData(response.data);
        } catch (error) {
            console.error('Error fetching form:', error);
            showToast('Error', 'Failed to fetch form data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSchemaChange = (schema) => {
        setFormData({
            ...formData,
            schema
        });
    };

    const generateValidationRules = (schema) => {
        const rules = {};
        schema.forEach(field => {
            if (field.required) {
                rules[field.name] = 'required';
                
                // Add type-specific validation
                if (field.type === 'email') {
                    rules[field.name] += '|email';
                } else if (field.type === 'number') {
                    rules[field.name] += '|numeric';
                } else if (field.type === 'file') {
                    rules[field.name] += '|file';
                }
            }
        });
        
        return rules;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        // Generate validation rules based on the schema
        const validation_rules = generateValidationRules(formData.schema);
        
        const dataToSubmit = {
            ...formData,
            validation_rules
        };

        try {
            if (isEditMode) {
                await updateForm(id, dataToSubmit);
                showToast('Success', 'Form updated successfully', 'success');
            } else {
                await createForm(dataToSubmit);
                showToast('Success', 'Form created successfully', 'success');
                navigate('/admin/forms');
            }
        } catch (error) {
            console.error('Error saving form:', error);
            showToast('Error', 'Failed to save form', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title={isEditMode ? `Edit Form: ${formData.name}` : 'Create New Form'}
                description={isEditMode ? 'Update form settings and fields' : 'Create a new form with customizable fields'}
                createButtonLabel={null}
            />

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Form Details</h3>
                        <p className="mt-1 text-sm text-gray-500">Basic information about your form.</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Form Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-4">
                                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                                    Form Slug
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        id="slug"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        placeholder="Leave blank to auto-generate from name"
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    Used in URLs and API endpoints. Use lowercase letters, numbers, and hyphens only.
                                </p>
                            </div>

                            <div className="sm:col-span-6">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        value={formData.description || ''}
                                        onChange={handleInputChange}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    Brief description of the form's purpose or use.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Form Builder</h3>
                        <p className="mt-1 text-sm text-gray-500">Create and arrange fields for your form.</p>
                    </div>
                    
                    <div className="p-6">
                        <FormBuilder 
                            value={formData.schema}
                            onChange={handleSchemaChange}
                        />
                    </div>
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Form Settings</h3>
                        <p className="mt-1 text-sm text-gray-500">Configure how your form works.</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="is_active"
                                            name="is_active"
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={handleInputChange}
                                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="is_active" className="font-medium text-gray-700">
                                            Active
                                        </label>
                                        <p className="text-gray-500">
                                            When enabled, the form will be available for submissions.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="store_submissions"
                                            name="store_submissions"
                                            type="checkbox"
                                            checked={formData.store_submissions}
                                            onChange={handleInputChange}
                                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="store_submissions" className="font-medium text-gray-700">
                                            Store Submissions
                                        </label>
                                        <p className="text-gray-500">
                                            When enabled, form submissions will be stored in the database and accessible in the admin panel.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="enable_captcha"
                                            name="enable_captcha"
                                            type="checkbox"
                                            checked={formData.enable_captcha}
                                            onChange={handleInputChange}
                                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="enable_captcha" className="font-medium text-gray-700">
                                            Enable CAPTCHA
                                        </label>
                                        <p className="text-gray-500">
                                            When enabled, form submissions will require CAPTCHA verification to prevent spam.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="send_notifications"
                                            name="send_notifications"
                                            type="checkbox"
                                            checked={formData.send_notifications}
                                            onChange={handleInputChange}
                                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="send_notifications" className="font-medium text-gray-700">
                                            Send Email Notifications
                                        </label>
                                        <p className="text-gray-500">
                                            When enabled, email notifications will be sent when forms are submitted.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {formData.send_notifications && (
                                <>
                                    <div className="sm:col-span-4 mt-4">
                                        <label htmlFor="notification_emails" className="block text-sm font-medium text-gray-700">
                                            Notification Emails
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="text"
                                                id="notification_emails"
                                                name="notification_emails"
                                                value={formData.notification_emails || ''}
                                                onChange={handleInputChange}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                placeholder="email@example.com, another@example.com"
                                            />
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Comma-separated list of email addresses to receive notifications.
                                        </p>
                                    </div>

                                    <div className="sm:col-span-6 mt-4">
                                        <label htmlFor="notification_template" className="block text-sm font-medium text-gray-700">
                                            Notification Template
                                        </label>
                                        <div className="mt-1">
                                            <textarea
                                                id="notification_template"
                                                name="notification_template"
                                                rows={5}
                                                value={formData.notification_template || ''}
                                                onChange={handleInputChange}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                placeholder="New submission for form: {{ form_name }}\n\nSubmission details:\n{{ submission_details }}"
                                            />
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Template for notification emails. You can use {{ form_name }} and {{ submission_details }} placeholders.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/forms')}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <FiSave className="-ml-1 mr-2 h-4 w-4" />
                                Save Form
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormEditor;
