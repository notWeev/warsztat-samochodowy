import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

const createMockContext = (userRole?: UserRole): ExecutionContext => {
  const mockRequest = userRole
    ? { user: { userId: 'u-1', email: 'a@b.com', role: userRole } }
    : { user: null };
  return {
    switchToHttp: () => ({ getRequest: () => mockRequest }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;
};

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(createMockContext(UserRole.MECHANIC));

    expect(result).toBe(true);
  });

  it('should allow access when user has a required role', () => {
    reflector.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN,
      UserRole.MANAGER,
    ]);

    const result = guard.canActivate(createMockContext(UserRole.ADMIN));

    expect(result).toBe(true);
  });

  it('should allow access when user has any of the required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN,
      UserRole.MANAGER,
    ]);

    const result = guard.canActivate(createMockContext(UserRole.MANAGER));

    expect(result).toBe(true);
  });

  it('should deny access when user does not have a required role', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    const result = guard.canActivate(createMockContext(UserRole.MECHANIC));

    expect(result).toBe(false);
  });

  it('should deny access when user is not authenticated', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    const result = guard.canActivate(createMockContext());

    expect(result).toBe(false);
  });

  it('should use ROLES_KEY with reflector.getAllAndOverride', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const mockContext = createMockContext(UserRole.ADMIN);

    guard.canActivate(mockContext);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
  });
});
