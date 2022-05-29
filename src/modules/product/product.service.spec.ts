import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductModule } from './product.module';
import { Product } from './product.model';
import { CategoryModule } from '../category/category.module';
import { Category } from '../category/category.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Messages } from '../shared/messages.constant';
import { getConnection } from 'typeorm';

describe('Product Service Test', () => {
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
          useFactory: () => {
            return {
              type: 'postgres',
              host: process.env.DB_HOST,
              port: +process.env.DB_PORT,
              username: process.env.DB_USER,
              password: process.env.DB_PASS,
              database: 'postgres',
              entities: [Product, Category],
              synchronize: true,
              ssl: false,
              keepConnectionAlive: true,
            };
          },
        }),
        ProductModule,
        CategoryModule,
        TypeOrmModule.forFeature([Product, Category]),
      ],
      providers: [ProductService],
    }).compile();

    productService = module.get<ProductService>(ProductService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    const entities = getConnection().entityMetadatas;
    for (const entity of entities) {
      const repository = await getConnection().getRepository(entity.name);
      await repository.query(
        `TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`,
      );
    }
  });

  it('should be defined', () => {
    expect(productService).toBeDefined();
  });

  it('should create new product', async () => {
    const data = {
      name: 'some name',
      category: null,
    };
    const result = await productService.create(data);
    expect(result.name).toBe(data.name);
    expect(result.category).toBe(data.category);
  });

  it('should throw notFound on create product with invalid category', async () => {
    try {
      const data = {
        name: 'some name other name',
        category: -1,
      };
      await productService.create(data);
    } catch (error) {
      expect(error.message).toBe(Messages.NOT_FOUND);
    }
  });

  it('should throw conflict on duplicate product', async () => {
    try {
      const data = {
        name: 'some name',
        category: null,
      };
      await productService.create(data);
    } catch (error) {
      expect(error.message).toBe(Messages.ALREADY_EXISTS);
    }
  });

  it('should get product list', async () => {
    const data = {
      name: 'some name',
      category: null,
    };
    await productService.create(data);
    const result = await productService.list();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should get product by id', async () => {
    const data = {
      name: 'some name',
      category: null,
    };
    const created = await productService.create(data);
    const result = await productService.find(created.id);
    expect(result.id).toBe(created.id);
  });

  it('should throw notFound to get product by id', async () => {
    try {
      await productService.find(-1);
    } catch (error) {
      expect(error.message).toBe(Messages.NOT_FOUND);
    }
  });

  it('should update product by id', async () => {
    const data = {
      name: 'some name',
      category: null,
    };
    const created = await productService.create(data);
    const updated = await productService.update(created.id, {
      name: 'updated name',
      category: null,
    });
    expect(updated.id).toBe(created.id);
    expect(updated.category).toBe(created.category);
    expect(updated.name).toBe('updated name');
  });

  it('should throw notFound update product by id', async () => {
    try {
      await productService.update(-1, {
        name: 'updated name',
        category: null,
      });
    } catch (error) {
      expect(error.message).toBe(Messages.NOT_FOUND);
    }
  });

  it('should delete product by id', async () => {
    const data = {
      name: 'some name',
      category: null,
    };
    const created = await productService.create(data);
    const result = await productService.remove(created.id);
    expect(result.affected).toBe(1);
  });
});
