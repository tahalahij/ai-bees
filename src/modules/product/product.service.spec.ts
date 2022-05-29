import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductModule } from './product.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Product, ProductDocument, ProductSchema } from './models/product.model';
import { Model, Types } from 'mongoose';
import { MESSAGES } from './constants/constants';

const getMockId = () => new Types.ObjectId();
const getMockProduct = (
  override: Partial<Product> = {},
): {
  parent: (() => Types.ObjectId) | Types.ObjectId;
  code: string;
  name: string;
  discount: number;
  _id: Types.ObjectId;
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

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGODB_URI'),
          }),
          inject: [ConfigService],
        }),
        ProductModule,
      ],
      providers: [ProductService],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productModel = module.get<Model<ProductDocument>>(getModelToken('Product'));
  });

  afterEach(async () => {
    await productModel.remove({});
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
      expect(product).toHaveProperty('parent', parent);
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
      expect(product).toHaveProperty('parent', parent);
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
      expect(product).toHaveProperty('parent', parent);
    });
    it('should throw error if product not found', async () => {
      await expect(productService.updateProduct(getMockId(), { code: 'new code' })).rejects.toThrow(
        MESSAGES.PRODUCT_NOT_FOUND,
      );
    });
  });
});
