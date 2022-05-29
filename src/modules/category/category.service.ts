import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './models/category.model';
import { MESSAGES } from './constants/constants';
import { CreateCategoryDto, UpdateCategoryDto } from './dtos/category.dto';

@Injectable()
export class CategoryService {
  logger = new Logger();
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  async getCategories(page = 1, pageSize = 10): Promise<Category[]> {
    const skip = (page - 1) * pageSize;
    const categories = await this.categoryModel.find({}).skip(skip).limit(pageSize).lean();
    this.logger.debug('getCategories', { categories });
    return categories;
  }

  async getCategoryById(id: number): Promise<Category> {
    const category = await this.categoryModel.findById(id).lean();
    this.logger.debug('getCategoryById', { category });

    if (!category) {
      this.logger.debug(`getCategoryById, ${MESSAGES.CATEGORY_NOT_FOUND} ,id: ${id} `);
      throw new NotFoundException(MESSAGES.CATEGORY_NOT_FOUND);
    }

    return category;
  }

  async createCategory(body: CreateCategoryDto): Promise<Category> {
    const category = await this.categoryModel.create(body);

    this.logger.debug(`createCategory, category created: `, { category });
    return category;
  }

  async updateCategory(id: number, body: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryModel.findById(id);
    this.logger.debug('updateCategory', { category });

    if (!category) {
      this.logger.debug(`updateCategory, ${MESSAGES.CATEGORY_NOT_FOUND} ,id: ${id} `);
      throw new NotFoundException(MESSAGES.CATEGORY_NOT_FOUND);
    }
    category.set(body);
    return category.save();
  }
}
