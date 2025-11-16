import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceOrderPart } from './entities/service-order-part.entity';
import { AddPartToOrderDto } from './dto/add-part-to-order.dto';
import { UpdateOrderPartDto } from './dto/update-order-part.dto';
import { ServiceOrdersService } from '../service-orders/service-orders.service';
import { PartsService } from '../parts/parts.service';

@Injectable()
export class ServiceOrderPartsService {
  constructor(
    @InjectRepository(ServiceOrderPart)
    private readonly repo: Repository<ServiceOrderPart>,
    private readonly serviceOrdersService: ServiceOrdersService,
    private readonly partsService: PartsService,
  ) {}

  // Dodaje część do zlecenia
  async addPartToOrder(
    serviceOrderId: string,
    addPartDto: AddPartToOrderDto,
  ): Promise<ServiceOrderPart> {
    // Sprawdź czy zlecenie istnieje
    const serviceOrder =
      await this.serviceOrdersService.findOne(serviceOrderId);
    if (!serviceOrder) {
      throw new NotFoundException('Zlecenie nie istnieje');
    }

    // Sprawdź czy część istnieje
    const part = await this.partsService.findOne(addPartDto.partId);
    if (!part) {
      throw new NotFoundException('Część nie istnieje');
    }

    // Sprawdź czy jest wystarczająca ilość na stanie
    if (part.quantityInStock < addPartDto.quantity) {
      throw new BadRequestException(
        `Niewystarczająca ilość na stanie. Dostępne: ${part.quantityInStock}, wymagane: ${addPartDto.quantity}`,
      );
    }

    // Użyj podanej ceny lub domyślnej ceny sprzedaży
    const unitPrice = addPartDto.unitPrice ?? Number(part.sellingPrice);
    const totalPrice = unitPrice * addPartDto.quantity;

    // Utwórz wpis w tabeli ServiceOrderPart
    const orderPart = this.repo.create({
      serviceOrderId,
      partId: addPartDto.partId,
      quantity: addPartDto.quantity,
      unitPrice,
      totalPrice,
      notes: addPartDto.notes,
    });

    const savedOrderPart = await this.repo.save(orderPart);

    // Zmniejsz stan magazynowy części
    await this.partsService.decreaseStock(
      addPartDto.partId,
      addPartDto.quantity,
    );

    // Zaktualizuj koszt części w zleceniu
    await this.updateServiceOrderCosts(serviceOrderId);

    return savedOrderPart;
  }

  // Pobiera wszystkie części przypisane do zlecenia
  async findByServiceOrder(
    serviceOrderId: string,
  ): Promise<ServiceOrderPart[]> {
    return this.repo.find({
      where: { serviceOrderId },
      relations: ['part'],
      order: { createdAt: 'ASC' },
    });
  }

  // Pobiera szczegóły pojedynczej części w zleceniu
  async findOne(id: string): Promise<ServiceOrderPart> {
    const orderPart = await this.repo.findOne({
      where: { id },
      relations: ['part', 'serviceOrder'],
    });

    if (!orderPart) {
      throw new NotFoundException('Część w zleceniu nie istnieje');
    }

    return orderPart;
  }

  // Aktualizuje ilość części w zleceniu
  async update(
    id: string,
    updateDto: UpdateOrderPartDto,
  ): Promise<ServiceOrderPart> {
    const orderPart = await this.findOne(id);

    // Jeśli zmieniono ilość
    if (updateDto.quantity && updateDto.quantity !== orderPart.quantity) {
      const part = await this.partsService.findOne(orderPart.partId);
      const difference = updateDto.quantity - orderPart.quantity;

      // Zwiększono ilość - zmniejsz stan magazynowy
      if (difference > 0) {
        if (part.quantityInStock < difference) {
          throw new BadRequestException(
            `Niewystarczająca ilość na stanie. Dostępne: ${part.quantityInStock}`,
          );
        }
        await this.partsService.decreaseStock(orderPart.partId, difference);
      }
      // Zmniejszono ilość - zwiększ stan magazynowy
      else {
        await this.partsService.increaseStock(
          orderPart.partId,
          Math.abs(difference),
        );
      }

      // Przelicz totalPrice
      orderPart.quantity = updateDto.quantity;
      orderPart.totalPrice = orderPart.unitPrice * orderPart.quantity;
    }

    if (updateDto.notes !== undefined) {
      orderPart.notes = updateDto.notes;
    }

    const updated = await this.repo.save(orderPart);

    // Zaktualizuj koszt części w zleceniu
    await this.updateServiceOrderCosts(orderPart.serviceOrderId);

    return updated;
  }

  // Usuwa część ze zlecenia
  async remove(id: string): Promise<void> {
    const orderPart = await this.findOne(id);

    // Przywróć stan magazynowy
    await this.partsService.increaseStock(orderPart.partId, orderPart.quantity);

    await this.repo.remove(orderPart);

    // Zaktualizuj koszt części w zleceniu
    await this.updateServiceOrderCosts(orderPart.serviceOrderId);
  }

  // Aktualizuje partsCost i totalCost w zleceniu
  private async updateServiceOrderCosts(serviceOrderId: string): Promise<void> {
    const orderParts = await this.repo.find({
      where: { serviceOrderId },
    });

    const partsCost = orderParts.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );

    await this.serviceOrdersService.update(serviceOrderId, {
      partsCost,
    });
  }

  // Oblicza całkowity koszt części dla zlecenia
  async calculatePartsCost(serviceOrderId: string): Promise<number> {
    const orderParts = await this.repo.find({
      where: { serviceOrderId },
    });

    return orderParts.reduce((sum, item) => sum + Number(item.totalPrice), 0);
  }
}
