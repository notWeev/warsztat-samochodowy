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
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PartCategory, PartStatus } from './entities/part.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('parts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  /**
   * POST /parts
   * Tworzy nową część
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPartDto: CreatePartDto) {
    return this.partsService.create(createPartDto);
  }

  /**
   * GET /parts
   * Pobiera listę części
   */
  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    const partCategory =
      category && Object.values(PartCategory).includes(category as PartCategory)
        ? (category as PartCategory)
        : undefined;

    const partStatus =
      status && Object.values(PartStatus).includes(status as PartStatus)
        ? (status as PartStatus)
        : undefined;

    const isLowStock = lowStock === 'true';

    return this.partsService.findAll(
      page,
      limit,
      search,
      partCategory,
      partStatus,
      isLowStock,
    );
  }

  /**
   * GET /parts/stats
   * Statystyki części
   */
  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getStats() {
    return this.partsService.getStats();
  }

  /**
   * GET /parts/low-stock
   * Części z niskim stanem
   */
  @Get('low-stock')
  getLowStockParts() {
    return this.partsService.getLowStockParts();
  }

  /**
   * GET /parts/part-number/:partNumber
   * Wyszukaj po numerze katalogowym
   */
  @Get('part-number/:partNumber')
  findByPartNumber(@Param('partNumber') partNumber: string) {
    return this.partsService.findByPartNumber(partNumber);
  }

  /**
   * GET /parts/:id
   * Szczegóły części
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partsService.findOne(id);
  }

  /**
   * PATCH /parts/:id
   * Aktualizuje część
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updatePartDto: UpdatePartDto) {
    return this.partsService.update(id, updatePartDto);
  }

  /**
   * PATCH /parts/:id/increase-stock
   * Zwiększa stan magazynowy
   */
  @Patch(':id/increase-stock')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  increaseStock(
    @Param('id') id: string,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.partsService.increaseStock(id, quantity);
  }

  /**
   * PATCH /parts/:id/decrease-stock
   * Zmniejsza stan magazynowy
   */
  @Patch(':id/decrease-stock')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  decreaseStock(
    @Param('id') id: string,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.partsService.decreaseStock(id, quantity);
  }

  /**
   * DELETE /parts/:id
   * Usuwa część
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.partsService.remove(id);
  }
}
