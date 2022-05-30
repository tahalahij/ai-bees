import { IsNotEmpty, IsString, IsOptional, IsMongoId, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  code: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsMongoId()
  @IsOptional()
  @ApiPropertyOptional()
  parent: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  discount: number;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  code?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;

  @IsMongoId()
  @IsOptional()
  @ApiPropertyOptional()
  parent?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  discount?: number;
}

export class GetDiscountDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  code?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  amount: number;
}
