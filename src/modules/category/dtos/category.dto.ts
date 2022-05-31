import { IsNotEmpty, IsString, IsNumber, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsMongoId()
  @IsOptional()
  @ApiPropertyOptional()
  parent?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  discount?: number;
}

export class UpdateCategoryDto {
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
