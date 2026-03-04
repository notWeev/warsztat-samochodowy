import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface RequestWithUser {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // Brak restrykcji na endpoincie
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Jeżeli użytkownik nie jest zalogowany lub nie ma roli
    if (!user || !user.role) {
      return false;
    }

    // Weryfikacja, czy rola użytkownika znajduje się na liście wymaganych ról
    return requiredRoles.some((role) => user.role === role);
  }
}
