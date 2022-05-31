import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './models/product.model';
import { MESSAGES } from './constants/constants';
import { CreateProductDto, GetDiscountDto, UpdateProductDto } from './dtos/product.dto';
import { CategoryService } from '../category/category.service';

@Injectable()
export class ProductService {
  logger = new Logger(ProductService.name);
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private categoryService: CategoryService,
  ) {}

  async getProducts(page = 1, pageSize = 10): Promise<Product[]> {
    const skip = (page - 1) * pageSize;
    const categories = await this.productModel.find({}).skip(skip).limit(pageSize).lean();
    this.logger.debug('getProducts', { categories });
    return categories;
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).lean();
    this.logger.debug('getProductById', { product });

    if (!product) {
      this.logger.debug(`getProductById, ${MESSAGES.PRODUCT_NOT_FOUND} ,id: ${id} `);
      throw new NotFoundException(MESSAGES.PRODUCT_NOT_FOUND);
    }

    return product;
  }

  async createProduct(body: CreateProductDto): Promise<Product> {
    const exists = await this.productModel.exists({ code: body.code });
    if (exists) {
      this.logger.debug(`createProduct, ${MESSAGES.PRODUCT_DUPLICATE_CODE} ,code: ${body.code} `);
      throw new BadRequestException(MESSAGES.PRODUCT_DUPLICATE_CODE);
    }
    const product = await this.productModel.create(body);

    this.logger.debug(`createProduct, product created: `, { product });
    return product;
  }

  async updateProduct(id: string, body: UpdateProductDto): Promise<Product> {
    const exists = await this.productModel.exists({ code: body.code });
    if (exists) {
      this.logger.debug(`updateProduct, ${MESSAGES.PRODUCT_DUPLICATE_CODE} ,code: ${body.code} `);
      throw new BadRequestException(MESSAGES.PRODUCT_DUPLICATE_CODE);
    }
    const product = await this.productModel.findById(id);
    this.logger.debug('updateProduct', { product });

    if (!product) {
      this.logger.debug(`updateProduct, ${MESSAGES.PRODUCT_NOT_FOUND} ,id: ${id} `);
      throw new NotFoundException(MESSAGES.PRODUCT_NOT_FOUND);
    }
    product.set(body);
    return product.save();
  }

  async getDiscount({ amount, code }: GetDiscountDto): Promise<{
    discount: number;
    amountAfterDiscount: number;
  }> {
    const product = await this.productModel.findOne({ code }).populate('parent');
    this.logger.debug('getDiscount', { product });

    if (!product) {
      this.logger.debug(
        `getDiscount, ${MESSAGES.PRODUCT_NOT_FOUND} ,code: ${code} `,
      );
      throw new NotFoundException(MESSAGES.PRODUCT_NOT_FOUND);
    }
    let discount = product.discount;

    if (!discount) {
      if (!product.parent) {
        return {
          amountAfterDiscount: amount,
          discount: -1,
        };
      }
      discount = await this.categoryService.findDiscount(product.parent);
    }

    const result = {
      amountAfterDiscount: discount === -1 ? amount : (amount * (100 - discount)) / 100,
      discount,
    };
    this.logger.debug('getDiscount discount calculated', { result });
    return result;
  }
}
