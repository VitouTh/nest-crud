import { Controller, Get, Patch, UseGuards, Req, Body} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import { EditUserDto } from './dto'

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
    constructor(private userService: UserService){}
    @Get('me')
    getMe(@GetUser() user: User){

        return user;
    }

    @Patch()
    editUser(
      @GetUser('id') userId: number,
      @Body() dto: EditUserDto,
    ) {
      return this.userService.editUser(userId, dto);
    }
}
