import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryModule } from './category.module';
import { Category } from './category.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Messages } from '../shared/messages.constant';
import { getConnection } from 'typeorm';
import { CreateDto } from './category.dto';

describe('Category Service Test', () => {
  let categoryService: CategoryService;

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
              entities: [Category, Category],
              synchronize: true,
              ssl: false,
              keepConnectionAlive: true,
            };
          },
        }),
        CategoryModule,
        CategoryModule,
        TypeOrmModule.forFeature([Category, Category]),
      ],
      providers: [CategoryService],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    const entities = getConnection().entityMetadatas;
    for (const entity of entities) {
      const repository = await getConnection().getRepository(entity.name);
      await repository.query(`TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`);
    }
  });

  it('should be defined', () => {
    expect(categoryService).toBeDefined();
  });

  it('should create new category', async () => {
    const data: CreateDto = {
      name: 'some name',
      parent: null,
      discount: 20,
    };
    const result = await categoryService.createCategory(data);
    expect(result.name).toBe(data.name);
    expect(result.discount).toBe(data.discount);
    expect(result.parent).toBe(data.parent);
  });

  it('should throw notFound on create category with invalid parent', async () => {
    try {
      const data: CreateDto = {
        name: 'some name',
        parent: null,
        discount: 20,
      };
      await categoryService.createCategory(data);
    } catch (error) {
      expect(error.message).toBe(Messages.NOT_FOUND);
    }
  });

  it('should throw conflict on duplicate category', async () => {
    try {
      const data: CreateDto = {
        name: 'some name',
        parent: null,
        discount: 20,
      };
      const data2: CreateDto = {
        name: 'some name',
        parent: null,
        discount: 20,
      };
      await categoryService.createCategory(data);
      await categoryService.createCategory(data2);
    } catch (error) {
      expect(error.message).toBe(Messages.ALREADY_EXISTS);
    }
  });

  it('should get category list', async () => {
    const data: CreateDto = {
      name: 'some name',
      parent: null,
      discount: 20,
    };
    await categoryService.createCategory(data);
    const result = await categoryService.getCategories();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should get category by id', async () => {
    const data: CreateDto = {
      name: 'some name',
      parent: null,
      discount: 20,
    };
    const created = await categoryService.createCategory(data);
    const result = await categoryService.getCategoryById(created.id);
    expect(result.id).toBe(created.id);
  });

  it('should throw notFound to get category by id', async () => {
    try {
      await categoryService.getCategoryById(-1);
    } catch (error) {
      expect(error.message).toBe(Messages.NOT_FOUND);
    }
  });

  it('should update category by id', async () => {
    const data: CreateDto = {
      name: 'some name',
      parent: null,
      discount: 20,
    };
    const created = await categoryService.createCategory(data);
    const updated = await categoryService.updateCategory(created.id, {
      name: 'updated name',
      parent: null,
      discount: 10,
    });
    expect(updated.id).toBe(created.id);
    expect(updated.parent).toBe(created.parent);
    expect(updated.name).toBe('updated name');
    expect(updated.discount).toBe(10);
  });

  it('should throw notFound update category by id', async () => {
    try {
      await categoryService.updateCategory(-1, {
        name: 'some name',
        parent: null,
        discount: 20,
      });
    } catch (error) {
      expect(error.message).toBe(Messages.NOT_FOUND);
    }
  });

  it('should delete category by id', async () => {
    const data = {
      name: 'some name',
      parent: null,
      discount: 20,
    };
    const created = await categoryService.createCategory(data);
    const result = await categoryService.deleteCategory(created.id);
    expect(result.affected).toBe(1);
  });
});
