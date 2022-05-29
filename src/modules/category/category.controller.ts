import { Body, Controller, Get, Param, Post, Query, ParseIntPipe, Patch } from '@nestjs/common';
import { Category } from './models/category.model';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dtos/category.dto';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}
  @ApiCreatedResponse()
  @Post()
  create(@Body() createDto: CreateCategoryDto) {
    return this.service.createCategory(createDto);
  }

  @ApiQuery({ name: 'id', description: 'id of category' })
  @ApiNotFoundResponse()
  @ApiOkResponse()
  @Patch(':id')
  updateCategory(
    @Param('id') id: Types.ObjectId,
    @Body() body: UpdateCategoryDto,
  ): Promise<Category> {
    return this.service.updateCategory(id, body);
  }

  @ApiQuery({ name: 'page', description: '# of docs return per call' })
  @ApiQuery({
    name: 'page-size',
    description: 'to get rest of data increase this param',
  })
  @ApiOkResponse()
  @Get()
  getCategories(
    @Query('page', ParseIntPipe) page: number,
    @Query('page-size', ParseIntPipe) pageSize: number,
  ): Promise<Category[]> {
    return this.service.getCategories(page, pageSize);
  }

  @ApiQuery({ name: 'id', description: 'id of category' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Get(':id')
  getCategoryById(@Param('id') id: Types.ObjectId): Promise<Category> {
    return this.service.getCategoryById(id);
  }
}
