import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './models/user.model';
import { SignupDto } from './dtos/auth.dto';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userModel.findOne({ username, password });
    this.logger.debug(`validateUser: `, { user });
    return user ? user : null;
  }

  async signup(body: SignupDto): Promise<User> {
    const user = await this.userModel.create(body);
    this.logger.debug(`user created: `, { user });
    return user;
  }

  async login(user: UserDocument): Promise<{ accessToken: string }> {
    return {
      accessToken: this.jwtService.sign({username:user.username, id:user._id}),
    };
  }
}
