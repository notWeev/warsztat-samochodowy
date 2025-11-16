import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOrderPartsService } from './service-order-parts.service';
import { ServiceOrderPartsController } from './service-order-parts.controller';
import { ServiceOrderPart } from './entities/service-order-part.entity';
import { ServiceOrdersModule } from '../service-orders/service-orders.module';
import { PartsModule } from '../parts/parts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceOrderPart]),
    ServiceOrdersModule,
    PartsModule,
  ],
  controllers: [ServiceOrderPartsController],
  providers: [ServiceOrderPartsService],
  exports: [ServiceOrderPartsService],
})
export class ServiceOrderPartsModule {}
