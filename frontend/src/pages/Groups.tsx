import React, { useEffect, useState } from 'react';
import { FiPlus, FiUsers } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { groupService } from '../services/groupService';
import { Group } from '../types';

import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await groupService.getGroups();
      if (response.success && response.data) {
        setGroups(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await groupService.createGroup({
        name: formData.name,
        description: formData.description,
        memberIds: [], // Start with empty members, can add later
      });
      toast.success('Group created successfully');
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create group');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bill Sharing Groups</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus className="inline mr-2" />
          Create Group
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : groups.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No groups yet</h3>
            <p className="mt-1 text-sm text-gray-500">Create a group to start sharing bills with friends.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group._id}>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                  {group.description && <p className="text-sm text-gray-500 mt-1">{group.description}</p>}
                </div>

                <div className="flex items-center justify-between py-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Members</span>
                  <span className="text-sm font-medium text-gray-900">{group.members.length}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Total Bills</span>
                  <span className="text-sm font-medium text-gray-900">{group.bills.length}</span>
                </div>

                <Button variant="secondary" size="sm" className="w-full" onClick={() => toast('Group details coming soon!')}>
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Group">
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <Input
            label="Group Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Roommates, Trip to Bali"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="What is this group for?"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Group</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Groups;
