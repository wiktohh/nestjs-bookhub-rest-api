import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends HttpException {
  constructor(message?: string) {
    super(message || 'Invalid credentials', HttpStatus.UNAUTHORIZED);
  }
}
