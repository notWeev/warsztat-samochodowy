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
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleStatus } from './entities/vehicle.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  /**
   * POST /vehicles
   * Tworzy nowy pojazd
   * Dostępne dla: ADMIN, MANAGER, RECEPTION
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTION)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  /**
   * GET /vehicles
   * Pobiera listę pojazdów z paginacją i wyszukiwaniem
   * Dostępne dla: wszyscy zalogowani
   */
  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('search') search?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ) {
    const vehicleStatus =
      status && Object.values(VehicleStatus).includes(status as VehicleStatus)
        ? (status as VehicleStatus)
        : undefined;

    return this.vehiclesService.findAll(
      page,
      limit,
      search,
      customerId,
      vehicleStatus,
    );
  }

  /**
   * GET /vehicles/stats
   * Pobiera statystyki pojazdów
   * Dostępne dla: ADMIN, MANAGER
   */
  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getStats() {
    return this.vehiclesService.getStats();
  }

  /**
   * GET /vehicles/vin/:vin
   * Wyszukuje pojazd po VIN
   * Dostępne dla: wszyscy zalogowani
   */
  @Get('vin/:vin')
  findByVin(@Param('vin') vin: string) {
    return this.vehiclesService.findByVin(vin);
  }

  /**
   * GET /vehicles/customer/:customerId
   * Pobiera pojazdy konkretnego klienta
   * Dostępne dla: wszyscy zalogowani
   */
  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.vehiclesService.findByCustomer(customerId);
  }

  /**
   * GET /vehicles/:id
   * Pobiera szczegóły pojazdu
   * Dostępne dla: wszyscy zalogowani
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  /**
   * PATCH /vehicles/:id
   * Aktualizuje dane pojazdu
   * Dostępne dla: ADMIN, MANAGER, RECEPTION
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTION)
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  /**
   * DELETE /vehicles/:id
   * Usuwa pojazd
   * Dostępne dla: ADMIN
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}
