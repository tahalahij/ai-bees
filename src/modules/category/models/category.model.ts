import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type CategoryDocument = Category & Document;
@Schema()
export class Category {
  @Prop({ type: 'String', required: true })
  name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
  })
  parent?: string;

  @Prop({ type: 'Number', default: 0 })
  discount: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
