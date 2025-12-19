import Contact, { IContact } from '../models/Contact';
import { Transaction } from '../models/Transaction';

export const contactService = {
  async createContact(userId: string, data: Partial<IContact>) {
    const contact = new Contact({
      userId,
      ...data,
    });
    await contact.save();
    return contact;
  },

  async getContacts(userId: string, filters: any = {}) {
    const query: any = { userId, isActive: true };

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .sort({ lastTransactionDate: -1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Contact.countDocuments(query),
    ]);

    return {
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getContactById(userId: string, contactId: string) {
    const contact = await Contact.findOne({
      _id: contactId,
      userId,
      isActive: true,
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    return contact;
  },

  async updateContact(userId: string, contactId: string, data: Partial<IContact>) {
    const contact = await Contact.findOneAndUpdate(
      { _id: contactId, userId, isActive: true },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!contact) {
      throw new Error('Contact not found');
    }

    return contact;
  },

  async deleteContact(userId: string, contactId: string) {
    const contact = await Contact.findOneAndUpdate(
      { _id: contactId, userId, isActive: true },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!contact) {
      throw new Error('Contact not found');
    }

    return contact;
  },

  async updateContactStats(userId: string, contactName: string, amount: number) {
    await Contact.findOneAndUpdate(
      { userId, name: contactName, isActive: true },
      {
        $inc: { totalTransactions: 1, totalAmount: amount },
        $set: { lastTransactionDate: new Date() },
      },
      { upsert: false }
    );
  },

  async getContactTransactions(userId: string, contactId: string) {
    const contact = await this.getContactById(userId, contactId);

    const transactions = await Transaction.find({
      userId,
      $or: [
        { description: { $regex: contact.name, $options: 'i' } },
        { notes: { $regex: contact.name, $options: 'i' } },
      ],
    })
      .populate('category')
      .sort({ date: -1 })
      .limit(50);

    return transactions;
  },

  async getFrequentContacts(userId: string, limit: number = 10) {
    const contacts = await Contact.find({
      userId,
      isActive: true,
    })
      .sort({ totalTransactions: -1, lastTransactionDate: -1 })
      .limit(limit)
      .lean();

    return contacts;
  },
};
