import { Controller } from '@nestjs/common';
import { CreateUserDTO } from './create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  async createUser(user: CreateUserDTO) {
    return this.userService.createUser(user);
  }
}
