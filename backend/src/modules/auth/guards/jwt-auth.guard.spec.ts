import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extend AuthGuard("jwt")', () => {
    expect(guard).toBeInstanceOf(AuthGuard('jwt'));
  });

  it('should call super.canActivate and return true for valid token', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer valid-token' },
        }),
      }),
    } as ExecutionContext;

    const superCanActivateSpy = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockResolvedValue(true);

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    superCanActivateSpy.mockRestore();
  });

  it('should throw UnauthorizedException for invalid token', async () => {
    const superCanActivateSpy = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockRejectedValue(new UnauthorizedException());

    const mockContext = {} as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );

    superCanActivateSpy.mockRestore();
  });
});
