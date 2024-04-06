import { SetMetadata } from '@nestjs/common';

const ROLE_KEY = 'role';
export const Role = (role: string) => SetMetadata(ROLE_KEY, role);
