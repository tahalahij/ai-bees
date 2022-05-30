import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { Category } from '../../category/models/category.model';

export type ProductDocument = Product & Document;
@Schema()
export class Product {
  @Prop({ type: 'String', required: true, unique: true })
  code: string;

  @Prop({ type: 'String', required: true })
  name: string;

  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, required: false })
  parent?: string | Types.ObjectId;

  @Prop({ type: 'Number' })
  discount: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
