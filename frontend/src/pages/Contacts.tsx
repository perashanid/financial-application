import React, { useEffect, useState } from 'react';
import { FiPlus, FiUser, FiBriefcase, FiMail, FiPhone, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { contactService } from '../services/contactService';
import { Contact, ContactFormData } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';
import Pagination from '../components/Common/Pagination';

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'person' | 'organization'>('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    type: 'person',
    email: '',
    phone: '',
    address: '',
    notes: '',
    tags: [],
  });

  useEffect(() => {
    fetchContacts();
  }, [pagination.page, typeFilter, searchTerm]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await contactService.getContacts(params);
      if (response.success && response.data) {
        setContacts(response.data.contacts);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await contactService.updateContact(editingContact._id, formData);
        toast.success('Contact updated successfully');
      } else {
        await contactService.createContact(formData);
        toast.success('Contact created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchContacts();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to save contact');
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      type: contact.type,
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || '',
      notes: contact.notes || '',
      tags: contact.tags || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      await contactService.deleteContact(id);
      toast.success('Contact deleted successfully');
      fetchContacts();
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'person',
      email: '',
      phone: '',
      address: '',
      notes: '',
      tags: [],
    });
    setEditingContact(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  if (loading && contacts.length === 0) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus className="mr-2" /> Add Contact
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="person">People</option>
            <option value="organization">Organizations</option>
          </select>
        </div>
      </Card>

      {/* Contacts Grid */}
      {contacts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No contacts found. Add your first contact to get started.</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <Card key={contact._id}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-full ${contact.type === 'person' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                        {contact.type === 'person' ? (
                          <FiUser className="h-5 w-5 text-blue-600" />
                        ) : (
                          <FiBriefcase className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-xs text-gray-500 capitalize">{contact.type}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {contact.email && (
                      <div className="flex items-center text-gray-600">
                        <FiMail className="h-4 w-4 mr-2" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center text-gray-600">
                        <FiPhone className="h-4 w-4 mr-2" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Transactions</span>
                      <span className="font-semibold text-gray-900">{contact.totalTransactions}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(contact.totalAmount)}</span>
                    </div>
                    {contact.lastTransactionDate && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">Last Transaction</span>
                        <span className="text-gray-500">{formatDate(contact.lastTransactionDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={(page) => setPagination({ ...pagination, page })}
          />
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingContact ? 'Edit Contact' : 'Add Contact'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter contact name"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'person' | 'organization' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="person">Person</option>
              <option value="organization">Organization</option>
            </select>
          </div>

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address"
          />

          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
          />

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Enter address"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Add any notes..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingContact ? 'Update' : 'Create'} Contact
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Contacts;
