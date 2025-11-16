import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServiceOrderPartsService } from './service-order-parts.service';
import { AddPartToOrderDto } from './dto/add-part-to-order.dto';
import { UpdateOrderPartDto } from './dto/update-order-part.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('service-orders/:serviceOrderId/parts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceOrderPartsController {
  constructor(
    private readonly serviceOrderPartsService: ServiceOrderPartsService,
  ) {}

  /**
   * POST /service-orders/:serviceOrderId/parts
   * Dodaje część do zlecenia
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.MECHANIC)
  @HttpCode(HttpStatus.CREATED)
  addPartToOrder(
    @Param('serviceOrderId') serviceOrderId: string,
    @Body() addPartDto: AddPartToOrderDto,
  ) {
    return this.serviceOrderPartsService.addPartToOrder(
      serviceOrderId,
      addPartDto,
    );
  }

  /**
   * GET /service-orders/:serviceOrderId/parts
   * Pobiera listę części w zleceniu
   */
  @Get()
  findByServiceOrder(@Param('serviceOrderId') serviceOrderId: string) {
    return this.serviceOrderPartsService.findByServiceOrder(serviceOrderId);
  }

  /**
   * GET /service-orders/:serviceOrderId/parts/:id
   * Pobiera szczegóły części w zleceniu
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceOrderPartsService.findOne(id);
  }

  /**
   * PATCH /service-orders/:serviceOrderId/parts/:id
   * Aktualizuje ilość części w zleceniu
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.MECHANIC)
  update(@Param('id') id: string, @Body() updateDto: UpdateOrderPartDto) {
    return this.serviceOrderPartsService.update(id, updateDto);
  }

  /**
   * DELETE /service-orders/:serviceOrderId/parts/:id
   * Usuwa część ze zlecenia
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.serviceOrderPartsService.remove(id);
  }
}
