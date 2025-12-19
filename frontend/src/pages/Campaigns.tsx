import React, { useEffect, useState } from 'react';
import { FiPlus, FiTrendingUp, FiShare2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { campaignService } from '../services/campaignService';
import { Campaign } from '../types';
import { formatCurrency } from '../utils/formatters';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    visibility: 'public' as 'public' | 'private',
    category: '',
  });
  const [contributeData, setContributeData] = useState({
    amount: '',
    message: '',
    isAnonymous: false,
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignService.getCampaigns();
      if (response.success && response.data) {
        setCampaigns(Array.isArray(response.data) ? response.data : []);
      } else {
        console.error('Campaign response:', response);
      }
    } catch (error: any) {
      console.error('Failed to fetch campaigns:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (campaign: Campaign) => {
    return (campaign.raisedAmount / campaign.goalAmount) * 100;
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await campaignService.createCampaign({
        title: formData.title,
        description: formData.description,
        goalAmount: parseFloat(formData.goalAmount),
        visibility: formData.visibility,
        category: formData.category || undefined,
      });
      if (response.success) {
        toast.success('Campaign created successfully!');
        setShowCreateModal(false);
        setFormData({ title: '', description: '', goalAmount: '', visibility: 'public', category: '' });
        fetchCampaigns();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create campaign');
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    try {
      const response = await campaignService.contribute(
        selectedCampaign._id,
        parseFloat(contributeData.amount),
        contributeData.message || undefined,
        contributeData.isAnonymous
      );
      if (response.success) {
        toast.success('Contribution successful!');
        setShowContributeModal(false);
        setContributeData({ amount: '', message: '', isAnonymous: false });
        fetchCampaigns();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to contribute');
    }
  };

  const handleShare = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowShareModal(true);
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/campaigns/${selectedCampaign?._id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this campaign: ${selectedCampaign?.title}`);
    const body = encodeURIComponent(
      `I thought you might be interested in this crowdfunding campaign:\n\n${selectedCampaign?.title}\n${selectedCampaign?.description}\n\nGoal: ${formatCurrency(selectedCampaign?.goalAmount || 0)}\nRaised: ${formatCurrency(selectedCampaign?.raisedAmount || 0)}\n\nView campaign: ${window.location.origin}/campaigns/${selectedCampaign?._id}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Crowdfunding Campaigns</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <FiPlus className="inline mr-2" />
          Create Campaign
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : campaigns.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FiTrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns yet</h3>
            <p className="mt-1 text-sm text-gray-500">Create a campaign to start raising funds.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign._id}>
              <div className="space-y-4">
                {campaign.coverImage && (
                  <img
                    src={campaign.coverImage}
                    alt={campaign.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{campaign.description}</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Raised: {formatCurrency(campaign.raisedAmount)}</span>
                    <span>Goal: {formatCurrency(campaign.goalAmount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(getProgress(campaign), 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{getProgress(campaign).toFixed(1)}% funded</p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{campaign.contributors?.length || 0} contributors</span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      campaign.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : campaign.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setShowContributeModal(true);
                    }}
                  >
                    Contribute
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleShare(campaign)}
                  >
                    <FiShare2 />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Campaign"
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <Input
            label="Campaign Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <Input
            label="Goal Amount"
            type="number"
            step="0.01"
            value={formData.goalAmount}
            onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
            required
          />
          <Input
            label="Category (Optional)"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visibility
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'public' | 'private' })}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Campaign
            </Button>
          </div>
        </form>
      </Modal>

      {/* Contribute Modal */}
      <Modal
        isOpen={showContributeModal}
        onClose={() => setShowContributeModal(false)}
        title={`Contribute to ${selectedCampaign?.title}`}
      >
        <form onSubmit={handleContribute} className="space-y-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={contributeData.amount}
            onChange={(e) => setContributeData({ ...contributeData, amount: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              value={contributeData.message}
              onChange={(e) => setContributeData({ ...contributeData, message: e.target.value })}
              placeholder="Leave a message of support..."
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="anonymous"
              checked={contributeData.isAnonymous}
              onChange={(e) => setContributeData({ ...contributeData, isAnonymous: e.target.checked })}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
              Contribute anonymously
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowContributeModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Contribute
            </Button>
          </div>
        </form>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Campaign"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Share this campaign with your contacts to help reach the funding goal!
          </p>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-900">{selectedCampaign?.title}</p>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(selectedCampaign?.raisedAmount || 0)} raised of {formatCurrency(selectedCampaign?.goalAmount || 0)}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={copyShareLink} variant="secondary" className="w-full">
              Copy Link
            </Button>
            <Button onClick={shareViaEmail} variant="secondary" className="w-full">
              Share via Email
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Campaigns;
