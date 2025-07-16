import {
  ApiProperty,
  ApiPropertyOptional,
  ApiExtraModels,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';

type Constructor<T = any> = new (...args: any[]) => T;

export function createSwaggerRes<
  TData extends Constructor,
  TPagination extends Constructor = any
>(
  DataDto: TData,
  PaginationDto?: TPagination,
  isArray: boolean = false
) {
  if (!DataDto || typeof DataDto !== 'function') {
    throw new Error('DataDto is undefined or not a class');
  }

  const className = `SwaggerRes_${DataDto.name}${
    PaginationDto ? '_' + PaginationDto.name : ''
  }${isArray ? '_Array' : ''}`;

  const DynamicResponse = {
    [className]: class {
      data: InstanceType<TData>[] | InstanceType<TData>;
      pagination?: InstanceType<TPagination>;
    },
  }[className];

  ApiProperty({ type: () => DataDto, isArray })(
    DynamicResponse.prototype,
    'data'
  );
  Type(() => DataDto)(DynamicResponse.prototype, 'data');
  if (PaginationDto) {
    ApiPropertyOptional({ type: () => PaginationDto })(
      DynamicResponse.prototype,
      'pagination'
    );
    Type(() => PaginationDto)(DynamicResponse.prototype, 'pagination');
  }
  ApiExtraModels(DynamicResponse);
  return { type: DynamicResponse };
}
