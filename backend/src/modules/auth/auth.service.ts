import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export type UserWithoutPassword = Omit<User, 'passwordHash'>;

interface ResetPasswordToken {
  sub: string;
  type: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.usersService.findByEmail(email, true);

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    await this.usersService.update(user.id, {
      lastLoginAt: new Date(),
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new BadRequestException('Ten email jest już zarejestrowany');
    }

    const user = await this.usersService.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      phone: registerDto.phone,
      password: registerDto.password,
      role: registerDto.role ?? UserRole.RECEPTION,
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Użytkownik nie znaleziony');
    }

    const userWithPassword = await this.usersService.findByEmail(
      user.email,
      true,
    );

    if (!userWithPassword) {
      throw new UnauthorizedException('Użytkownik nie znaleziony');
    }

    const isOldPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      userWithPassword.passwordHash,
    );

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Stare hasło jest nieprawidłowe');
    }

    const newPasswordHash = await bcrypt.hash(
      changePasswordDto.newPassword,
      parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
    );

    await this.usersService.update(userId, {
      passwordHash: newPasswordHash,
    });

    return { message: 'Hasło zostało pomyślnie zmienione' };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string; resetToken?: string }> {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    if (!user) {
      return {
        message:
          'Jeśli email istnieje w systemie, wysłano link do resetowania hasła',
      };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password-reset' },
      { expiresIn: '15m' },
    );

    // TODO W produkcji: wyślij email z linkiem zawierającym token
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    console.log(`[DEV] Reset token for ${user.email}: ${resetToken}`);

    return {
      message:
        'Jeśli email istnieje w systemie, wysłano link do resetowania hasła',
      resetToken,
    };
  }

  /**
   * Resetuje hasło przy użyciu tokenu z emaila
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    try {
      const decoded = this.jwtService.verify<ResetPasswordToken>(
        resetPasswordDto.token,
      );

      if (decoded.type !== 'password-reset') {
        throw new UnauthorizedException('Nieprawidłowy typ tokenu');
      }

      if (!decoded.sub) {
        throw new UnauthorizedException('Nieprawidłowy token');
      }

      const userId = decoded.sub;

      // Zahashuj nowe hasło
      const newPasswordHash = await bcrypt.hash(
        resetPasswordDto.newPassword,
        parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
      );

      // Zaktualizuj hasło
      await this.usersService.update(userId, {
        passwordHash: newPasswordHash,
      });

      return { message: 'Hasło zostało pomyślnie zresetowane' };
    } catch {
      throw new UnauthorizedException('Token jest nieprawidłowy lub wygasł');
    }
  }
}
