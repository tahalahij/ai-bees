import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductModule } from './product.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Product, ProductDocument, ProductSchema } from './models/product.model';
import { Model, Types } from 'mongoose';
import { MESSAGES } from './constants/constants';
import { Category, CategoryDocument, CategorySchema } from '../category/models/category.model';
import { CategoryModule } from '../category/category.module';

const getMockId = (): string => String(new Types.ObjectId());
const getMockProduct = (
  override: Partial<Product> = {},
): {
  parent: string;
  code: string;
  name: string;
  discount: number;
  _id: string;
} => {
  return {
    name: 'NAME',
    code: 'CODE',
    _id: getMockId(),
    parent: getMockId(),
    discount: 10,
    ...override,
  };
};
describe('Product Service Test', () => {
  let productService: ProductService;
  let productModel: Model<ProductDocument>;
  let categoryModel: Model<CategoryDocument>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        MongooseModule.forFeature([
          { name: Product.name, schema: ProductSchema },
          { name: Category.name, schema: CategorySchema },
        ]),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGODB_URI'),
          }),
          inject: [ConfigService],
        }),
        ProductModule,
        CategoryModule,
      ],
      providers: [ProductService],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productModel = module.get<Model<ProductDocument>>(getModelToken('Product'));
    categoryModel = module.get<Model<CategoryDocument>>(getModelToken('Category'));
  });

  beforeEach(async () => {
    await productModel.remove({});
    await categoryModel.remove({});
    jest.restoreAllMocks();
  });
  it('should be defined', () => {
    expect(productService).toBeDefined();
  });
  describe('createProduct', () => {
    it('should be defined', () => {
      expect(productService.createProduct).toBeDefined();
    });
    it('should create new product', async () => {
      const code = 'product code';
      const name = 'product name';
      const parent = getMockId();
      const discount = 5;
      const product = await productService.createProduct({
        code,
        name,
        parent,
        discount,
      });
      expect(product).toHaveProperty('name', name);
      expect(product).toHaveProperty('discount', discount);
      expect(product).toHaveProperty('parent');
      expect(String(product.parent)).toBe(parent);
      expect(product).toHaveProperty('code', code);
    });
    it('should throw error of product with this code exists', async () => {
      const code = 'product code';
      const name = 'product name';
      const parent = getMockId();
      const discount = 5;
      await productService.createProduct({
        code,
        name,
        parent,
        discount,
      });
      await expect(
        productService.createProduct({
          code,
          name,
          parent,
          discount,
        }),
      ).rejects.toThrow(MESSAGES.PRODUCT_DUPLICATE_CODE);
    });
  });

  describe('getProductById', () => {
    it('should be defined', () => {
      expect(productService.getProductById).toBeDefined();
    });
    it('should return product', async () => {
      const code = 'product code';
      const name = 'product name';
      const discount = 5;
      const doc = await productModel.create(getMockProduct({ name, discount, code }));
      const product = await productService.getProductById(doc._id);

      expect(product).toHaveProperty('name', doc.name);
      expect(product).toHaveProperty('discount', doc.discount);
      expect(product).toHaveProperty('code', doc.code);
      expect(product).toHaveProperty('parent', doc.parent);
    });
  });

  describe('getProductById', () => {
    it('should be defined', () => {
      expect(productService.getProductById).toBeDefined();
    });
    it('should return product', async () => {
      const code = 'product code';
      const parent = getMockId();
      const name = 'product name';
      const discount = 5;
      const doc = await productModel.create(getMockProduct({ name, discount, parent, code }));
      const product = await productService.getProductById(doc._id);
      expect(product).toHaveProperty('name', doc.name);
      expect(product).toHaveProperty('discount', doc.discount);
      expect(product).toHaveProperty('code', doc.code);
      expect(product).toHaveProperty('parent', doc.parent);
    });
    it('should throw error if product not found', async () => {
      await expect(productService.getProductById(getMockId())).rejects.toThrow(
        MESSAGES.PRODUCT_NOT_FOUND,
      );
    });
  });

  describe('updateProduct', () => {
    it('should be defined', () => {
      expect(productService.updateProduct).toBeDefined();
    });
    it('should return updated product', async () => {
      const code = 'product code';
      const name = 'product name';
      const discount = 5;
      const parent = getMockId();
      const doc = await productModel.create(getMockProduct({}));
      const product = await productService.updateProduct(doc._id, {
        discount,
        parent,
        name,
        code,
      });
      expect(product).toHaveProperty('name', name);
      expect(product).toHaveProperty('code', code);
      expect(product).toHaveProperty('discount', discount);
      expect(product).toHaveProperty('parent');
      expect(String(product.parent)).toBe(parent);
    });
    it('should throw error of product with this code exists', async () => {
      const code = 'product code';
      const name = 'product name';
      const parent = getMockId();
      const discount = 5;
      const product = await productModel.create({
        code,
        name,
        parent,
        discount,
      });
      await expect(
        productService.updateProduct(product._id, {
          code,
        }),
      ).rejects.toThrow(MESSAGES.PRODUCT_DUPLICATE_CODE);
    });
    it('should throw error if product not found', async () => {
      await expect(productService.updateProduct(getMockId(), { code: 'new code' })).rejects.toThrow(
        MESSAGES.PRODUCT_NOT_FOUND,
      );
    });
  });

  describe('getDiscount', () => {
    it('should be defined', () => {
      expect(productService.getDiscount).toBeDefined();
    });
    it('should use the discount of nested category', async () => {
      const code = 'product code';
      const name = 'product name';
      const amount = 1000;
      const category1 = await categoryModel.create({
        name: 'CATEGORY 1',
        parent: null,
        discount: 10,
      });
      const category2 = await categoryModel.create({
        name: 'CATEGORY 2',
        parent: category1._id,
        discount: 20,
      });
      await productModel.create({
        parent: category2._id,
        code,
        name,
      });
      const { amountAfterDiscount, discount } = await productService.getDiscount({
        amount,
        code,
        name,
      });
      expect(discount).toBe(category2.discount);
      expect(amountAfterDiscount).toBe(800);
    });
    it('should throw error if product not found', async () => {
      await expect(
        productService.getDiscount({ code: 'new code', amount: 1000, name: 'name' }),
      ).rejects.toThrow(MESSAGES.PRODUCT_NOT_FOUND);
    });
  });
});
