import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { contactService } from '../services/contactService';

export const contactController = {
  async createContact(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const contact = await contactService.createContact(userId, req.body);

      res.status(201).json({
        success: true,
        data: contact,
        message: 'Contact created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CREATE_CONTACT_ERROR',
          message: error.message,
        },
      });
    }
  },

  async getContacts(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const result = await contactService.getContacts(userId, req.query);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'GET_CONTACTS_ERROR',
          message: error.message,
        },
      });
    }
  },

  async getContactById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const contact = await contactService.getContactById(userId, req.params.id);

      res.json({
        success: true,
        data: contact,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CONTACT_NOT_FOUND',
          message: error.message,
        },
      });
    }
  },

  async updateContact(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const contact = await contactService.updateContact(userId, req.params.id, req.body);

      res.json({
        success: true,
        data: contact,
        message: 'Contact updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_CONTACT_ERROR',
          message: error.message,
        },
      });
    }
  },

  async deleteContact(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      await contactService.deleteContact(userId, req.params.id);

      res.json({
        success: true,
        message: 'Contact deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_CONTACT_ERROR',
          message: error.message,
        },
      });
    }
  },

  async getContactTransactions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const transactions = await contactService.getContactTransactions(userId, req.params.id);

      res.json({
        success: true,
        data: transactions,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'GET_CONTACT_TRANSACTIONS_ERROR',
          message: error.message,
        },
      });
    }
  },

  async getFrequentContacts(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const limit = parseInt(req.query.limit as string) || 10;
      const contacts = await contactService.getFrequentContacts(userId, limit);

      res.json({
        success: true,
        data: contacts,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'GET_FREQUENT_CONTACTS_ERROR',
          message: error.message,
        },
      });
    }
  },
};
