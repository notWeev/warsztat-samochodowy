import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ServiceOrdersService } from './service-orders.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import {
  ServiceOrderStatus,
  ServiceOrderPriority,
} from './entities/service-order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('service-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  /**
   * POST /service-orders
   * Tworzy nowe zlecenie
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTION)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createServiceOrderDto: CreateServiceOrderDto) {
    return this.serviceOrdersService.create(createServiceOrderDto);
  }

  /**
   * GET /service-orders
   * Pobiera listę zleceń
   */
  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('customerId') customerId?: string,
    @Query('mechanicId') mechanicId?: string,
  ) {
    const orderStatus =
      status &&
      Object.values(ServiceOrderStatus).includes(status as ServiceOrderStatus)
        ? (status as ServiceOrderStatus)
        : undefined;

    const orderPriority =
      priority &&
      Object.values(ServiceOrderPriority).includes(
        priority as ServiceOrderPriority,
      )
        ? (priority as ServiceOrderPriority)
        : undefined;

    return this.serviceOrdersService.findAll(
      page,
      limit,
      orderStatus,
      orderPriority,
      customerId,
      mechanicId,
    );
  }

  /**
   * GET /service-orders/stats
   * Statystyki zleceń
   */
  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getStats() {
    return this.serviceOrdersService.getStats();
  }

  /**
   * GET /service-orders/number/:orderNumber
   * Wyszukaj po numerze zlecenia
   */
  @Get('number/:orderNumber')
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.serviceOrdersService.findByOrderNumber(orderNumber);
  }

  /**
   * GET /service-orders/:id
   * Szczegóły zlecenia
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceOrdersService.findOne(id);
  }

  /**
   * PATCH /service-orders/:id
   * Aktualizuje zlecenie
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.MECHANIC)
  update(
    @Param('id') id: string,
    @Body() updateServiceOrderDto: UpdateServiceOrderDto,
  ) {
    return this.serviceOrdersService.update(id, updateServiceOrderDto);
  }

  /**
   * DELETE /service-orders/:id
   * Usuwa zlecenie
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.serviceOrdersService.remove(id);
  }
}
