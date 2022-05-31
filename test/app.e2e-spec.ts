import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { LoginDto, SignupDto } from '../src/modules/auth/dtos/auth.dto';
import { Model } from 'mongoose';
import { ProductDocument } from '../src/modules/product/models/product.model';
import { getModelToken } from '@nestjs/mongoose';
import { CategoryDocument } from '../src/modules/category/models/category.model';
import { UserDocument } from '../src/modules/auth/models/user.model';
import { CreateProductDto } from '../src/modules/product/dtos/product.dto';
import { CreateCategoryDto } from '../src/modules/category/dtos/category.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let productModel: Model<ProductDocument>;
  let categoryModel: Model<CategoryDocument>;
  let userModel: Model<UserDocument>;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    productModel = app.get<Model<ProductDocument>>(getModelToken('Product'));
    categoryModel = app.get<Model<CategoryDocument>>(getModelToken('Category'));
    userModel = app.get<Model<UserDocument>>(getModelToken('User'));
  });
  beforeEach(async () => {
    await productModel.remove({});
    await categoryModel.remove({});
    await userModel.remove({});
  });

  it('should singup user and then after login should create categories and product and get discount for product ', async () => {
    // signup
    const signupBody: SignupDto = {
      password: 'the secret',
      fullName: 'taha lahij',
      username: 'taha',
    };
    const signupRes = await request(app.getHttpServer())
      .post('/users/signup')
      .send(signupBody)
      .expect(201);
    const { username, password } = signupRes.body;

    // login
    const loginBody: LoginDto = {
      password,
      username,
    };
    const logindRes = await request(app.getHttpServer())
      .post('/users/login')
      .send(loginBody)
      .expect(200);
    const { accessToken } = logindRes.body;

    // create category
    const c1Body: CreateCategoryDto = {
      discount: 10,
      name: 'grand parent',
    };
    const c1BodyRes = await request(app.getHttpServer())
      .post('/products')
      .set({ authorization: `Bearer ${accessToken}` })
      .send(c1Body)
      .expect(201);
    const { _id: c1Id } = c1BodyRes.body;
    // c2
    const c2Body: CreateCategoryDto = {
      name: 'parent',
      parent: c1Id,
    };
    const c2BodyRes = await request(app.getHttpServer())
      .post('/products')
      .set({ authorization: `Bearer ${accessToken}` })
      .send(c2Body)
      .expect(201);
    const { _id: c2Id } = c2BodyRes.body;
    // c3

    const c3Body: CreateCategoryDto = {
      name: 'child',
      parent: c2Id,
    };
    const c3BodyRes = await request(app.getHttpServer())
      .post('/products')
      .set({ authorization: `Bearer ${accessToken}` })
      .send(c3Body)
      .expect(201);
    const { _id: childCategoryId } = c3BodyRes.body;

    // create product
    const productBody: CreateProductDto = {
      code: 'p1',
      name: 'p1',
      parent: childCategoryId,
    };
    const createProductRes = await request(app.getHttpServer())
      .post('/products')
      .set({ authorization: `Bearer ${accessToken}` })
      .send(productBody)
      .expect(201);
    const { code: productCode } = createProductRes.body;

    // get discount
    const getDiscountRes = await request(app.getHttpServer())
      .get(`/products/discount?code:${productCode}&amount=1000`)
      .set({ 'authorization': `Bearer ${accessToken}` })
      .expect(200);
    // const  = getDiscountRes.body;
    console.log({ getDiscountRes: getDiscountRes.body });
  });
});
