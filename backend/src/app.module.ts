import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { ServiceOrdersModule } from './modules/service-orders/service-orders.module';
import { PartsModule } from './modules/parts/parts.module';
import { ServiceOrderPartsModule } from './modules/service-order-parts/service-order-parts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    CustomersModule,
    VehiclesModule,
    ServiceOrdersModule,
    PartsModule,
    ServiceOrderPartsModule,
  ],
})
export class AppModule {}
