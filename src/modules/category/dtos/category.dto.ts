import { IsNotEmpty, IsString, IsNumber, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsMongoId()
  @ApiPropertyOptional()
  parent?: string | Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  discount: number;
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;

  @IsMongoId()
  @IsOptional()
  @ApiPropertyOptional()
  parent?: string | Types.ObjectId;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  discount?: number;
}
