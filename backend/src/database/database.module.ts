import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDataSourceOptions } from './data-source-options';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => buildDataSourceOptions(process.env),
    }),
  ],
})
export class DatabaseModule {}
