import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryModule } from './category.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Category, CategoryDocument, CategorySchema } from './models/category.model';
import { Model, Types } from 'mongoose';
import { MESSAGES } from './constants/constants';

const getMockId = () => String(new Types.ObjectId());
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
      const name = 'AI';
      const discount = 5;
      const parent = getMockId();
      const category = await categoryService.createCategory({
        name,
        discount,
        parent,
      });
      expect(category).toHaveProperty('name', name);
      expect(category).toHaveProperty('discount', discount);
      expect(category).toHaveProperty('parent');
      expect(String(category.parent)).toBe(parent);
    });
  });

  describe('getCategoryById', () => {
    it('should be defined', () => {
      expect(categoryService.getCategoryById).toBeDefined();
    });
    it('should return category', async () => {
      const name = 'ai';
      const discount = 5;
      const doc = await categoryModel.create({
        parent: getMockId(),
        name,
        discount,
      });
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
      const name = 'AI 2';
      const discount = 5;
      const doc = await categoryModel.create({
        name,
        discount,
        parent: getMockId(),
      });
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
      const name = 'AI 3';
      const discount = 5;
      const parent = getMockId();
      const doc = await categoryModel.create({
        name,
        discount,
        parent,
      });
      const category = await categoryService.updateCategory(doc._id, { discount, parent, name });
      expect(category).toHaveProperty('name', name);
      expect(category).toHaveProperty('discount', discount);
      expect(category).toHaveProperty('parent');
      expect(String(category.parent)).toBe(parent);
    });
    it('should throw error if category not found', async () => {
      await expect(
        categoryService.updateCategory(getMockId(), { name: 'new name' }),
      ).rejects.toThrow(MESSAGES.CATEGORY_NOT_FOUND);
    });
  });

  describe('findDiscount', () => {
    it('should be defined', () => {
      expect(categoryService.findDiscount).toBeDefined();
    });
    it('should return ancestors discount if category doesnt have discount', async () => {
      const name = 'AI 3';
      const discount = 100;
      const c1 = await categoryModel.create({
        name,
        discount,
      });
      const c2 = await categoryModel.create({
        name,
        parent: c1._id,
      });
      const c3 = await categoryModel.create({
        name,
        parent: c2._id,
      });
      const result = await categoryService.findDiscount(c3._id);
      expect(result).toBe(discount);
    });
    it('should return -1 if category doesnt have discount or parent', async () => {
      const name = 'AI 4';
      const c1 = await categoryModel.create({
        name,
      });
      const result = await categoryService.findDiscount(c1._id);
      expect(result).toBe(-1);
    });
  });
});
