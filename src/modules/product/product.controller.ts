import { Body, Controller, Get, Param, Post, Query, ParseIntPipe, Patch } from '@nestjs/common';
import { Product } from './models/product.model';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dtos/product.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @Post()
  create(@Body() createDto: CreateProductDto) {
    return this.productService.createProduct(createDto);
  }

  @ApiQuery({ name: 'id', description: 'id of product' })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiOkResponse()
  @Patch(':id')
  updateProduct(@Param('id') id: Types.ObjectId, @Body() body: UpdateProductDto): Promise<Product> {
    return this.productService.updateProduct(id, body);
  }

  @ApiQuery({ name: 'page', description: '# of docs return per call' })
  @ApiQuery({
    name: 'page-size',
    description: 'to get rest of data increase this param',
  })
  @ApiOkResponse()
  @Get()
  getProducts(
    @Query('page', ParseIntPipe) page: number,
    @Query('page-size', ParseIntPipe) pageSize: number,
  ): Promise<Product[]> {
    return this.productService.getProducts(page, pageSize);
  }

  @ApiQuery({ name: 'id', description: 'id of product' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Get(':id')
  getProductById(@Param('id') id: Types.ObjectId): Promise<Product> {
    return this.productService.getProductById(id);
  }

  @ApiQuery({ name: 'id', description: 'id of product' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Get(':id')
  getDiscount(
    @Query('name') name: string,
    @Query('code') code: string,
    @Query('amount', ParseIntPipe) amount: number,
  ): Promise<{
    discount: number;
    amountAfterDiscount: number;
  }> {
    return this.productService.getDiscount({ name, code, amount });
  }
}
