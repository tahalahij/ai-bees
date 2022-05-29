import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryModule } from './category.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Category, CategoryDocument, CategorySchema } from './models/category.model';
import { Model, Types } from 'mongoose';
import { MESSAGES } from './constants/constants';

const getMockId = () => new Types.ObjectId();
const getMockCategory = (
  override: Partial<Category> = {},
): {
  parent: (() => Types.ObjectId) | Types.ObjectId;
  name: string;
  discount: number;
  _id: Types.ObjectId;
} => {
  return {
    _id: getMockId(),
    name: 'CATEGORY',
    parent: getMockId(),
    discount: 10,
    ...override,
  };
};
describe('Category Service Test', () => {
  let categoryService: CategoryService;
  let categoryModel: Model<CategoryDocument>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGODB_URI'),
          }),
          inject: [ConfigService],
        }),
        CategoryModule,
      ],
      providers: [CategoryService],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
    categoryModel = module.get<Model<CategoryDocument>>(getModelToken('Category'));
  });

  afterEach(async () => {
    await categoryModel.remove({});
    jest.restoreAllMocks();
  });
  it('should be defined', () => {
    expect(categoryService).toBeDefined();
  });
  describe('createCategory', () => {
    it('should be defined', () => {
      expect(categoryService.createCategory).toBeDefined();
    });
    it('should create new category', async () => {
      const name = 'ai';
      const discount = 5;
      const category = await categoryService.createCategory({
        name,
        discount,
      });
      expect(category).toHaveProperty('name', name);
      expect(category).toHaveProperty('discount', discount);
      expect(category.parent).toBeFalsy();
    });
  });

  describe('getCategoryById', () => {
    it('should be defined', () => {
      expect(categoryService.getCategoryById).toBeDefined();
    });
    it('should return category', async () => {
      const name = 'ai';
      const discount = 5;
      const doc = await categoryModel.create(getMockCategory({ name, discount }));
      const category = await categoryService.getCategoryById(doc._id);
      expect(category).toHaveProperty('name', doc.name);
      expect(category).toHaveProperty('discount', doc.discount);
      expect(category).toHaveProperty('parent', doc.parent);
    });
  });

  describe('getCategoryById', () => {
    it('should be defined', () => {
      expect(categoryService.getCategoryById).toBeDefined();
    });
    it('should return category', async () => {
      const name = 'ai';
      const discount = 5;
      const doc = await categoryModel.create(getMockCategory({ name, discount }));
      const category = await categoryService.getCategoryById(doc._id);
      expect(category).toHaveProperty('name', doc.name);
      expect(category).toHaveProperty('discount', doc.discount);
      expect(category).toHaveProperty('parent', doc.parent);
    });
    it('should throw error if category not found', async () => {
      await expect(categoryService.getCategoryById(getMockId())).rejects.toThrow(
        MESSAGES.CATEGORY_NOT_FOUND,
      );
    });
  });

  describe('updateCategory', () => {
    it('should be defined', () => {
      expect(categoryService.updateCategory).toBeDefined();
    });
    it('should return updated category', async () => {
      const name = 'ai';
      const discount = 5;
      const parent = getMockId();
      const doc = await categoryModel.create(getMockCategory({}));
      const category = await categoryService.updateCategory(doc._id, { discount, parent, name });
      expect(category).toHaveProperty('name', name);
      expect(category).toHaveProperty('discount', discount);
      expect(category).toHaveProperty('parent', parent);
    });
    it('should throw error if category not found', async () => {
      await expect(
        categoryService.updateCategory(getMockId(), { name: 'new name' }),
      ).rejects.toThrow(MESSAGES.CATEGORY_NOT_FOUND);
    });
  });
});
