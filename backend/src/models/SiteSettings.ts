import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IHomepageSettings {
  banners: string[]; // hero/banner images (URLs)
  featuredProducts: Types.ObjectId[]; // product IDs
  saleProducts: Types.ObjectId[]; // product IDs with sale label
  bestSellerProducts: Types.ObjectId[]; // product IDs with best seller label
}

export interface ISiteSettings extends Document {
  key: string; // singleton key e.g., "homepage"
  homepage: IHomepageSettings;
}

const HomepageSchema = new Schema<IHomepageSettings>({
  banners: { type: [String], default: [] },
  featuredProducts: { type: [Schema.Types.ObjectId], ref: 'Product', default: [] },
  saleProducts: { type: [Schema.Types.ObjectId], ref: 'Product', default: [] },
  bestSellerProducts: { type: [Schema.Types.ObjectId], ref: 'Product', default: [] },
});

const SiteSettingsSchema = new Schema<ISiteSettings>({
  key: { type: String, required: true, unique: true, index: true },
  homepage: { type: HomepageSchema, default: {} },
}, { timestamps: true });

export const SiteSettings = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
