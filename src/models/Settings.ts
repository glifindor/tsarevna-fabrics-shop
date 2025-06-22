import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  shopName: string;
  shopDescription: string;
  shopPhone: string;
  shopEmail: string;
  shopAddress: string;
  enablePickup: boolean;
  enableDelivery: boolean;
  enableCash: boolean;
  enableCard: boolean;
}

const SettingsSchema = new Schema<ISettings>({
  shopName: { type: String, required: true },
  shopDescription: { type: String, required: true },
  shopPhone: { type: String, required: true },
  shopEmail: { type: String, required: true },
  shopAddress: { type: String, required: true },
  enablePickup: { type: Boolean, default: true },
  enableDelivery: { type: Boolean, default: true },
  enableCash: { type: Boolean, default: true },
  enableCard: { type: Boolean, default: true },
});

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema); 