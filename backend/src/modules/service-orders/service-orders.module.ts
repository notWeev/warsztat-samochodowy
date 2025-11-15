import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOrdersService } from './service-orders.service';
import { ServiceOrdersController } from './service-orders.controller';
import { ServiceOrder } from './entities/service-order.entity';
import { CustomersModule } from '../customers/customers.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { UsersModule } from '../users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceOrder]),
    CustomersModule,
    VehiclesModule,
    UsersModule,
  ],
  controllers: [ServiceOrdersController],
  providers: [ServiceOrdersService],
  exports: [ServiceOrdersService],
})
export class ServiceOrdersModule {}
