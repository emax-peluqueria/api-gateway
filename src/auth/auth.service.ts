import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/create-auth.dto';
import { MS_AUTH } from 'src/utils/nameMicroservices';
import { ClientProxy } from '@nestjs/microservices';
import axios from 'axios';
import { HEADERS_TOKEN, USER_URL } from 'src/config/env';
import { PayloadGoogleType } from './types/typesGoogle';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/payload.jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(MS_AUTH) private authClient: ClientProxy,
    private jwtService: JwtService,
  ) {}
  async login(createAuthDto: LoginDto) {
    try {
      const response = await axios.post(
        `${USER_URL}/users/login`,
        createAuthDto,
        {
          headers: {
            Authorization: `Bearer ${HEADERS_TOKEN}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new BadRequestException(error.response.data);
    }
  }
  async register(registerDto: RegisterDto) {
    try {
      const response = await axios.post(
        `${USER_URL}/users/register`,
        registerDto,
        {
          headers: {
            Authorization: `Bearer ${HEADERS_TOKEN}`,
          },
        },
      );
      this.authClient.emit('createMailWelcome', {
        email: registerDto.email,
        name: registerDto.name,
      });
      return response.data;
    } catch (error) {
      throw new BadRequestException(error.response.data);
    }
  }
  async findUser(mail: string) {
    console.log('EMAIL EN EL SERIALIZER', mail);

    try {
      if (mail == null) return null;
      const response = await axios(`${USER_URL}/users/mail`, {
        headers: {
          Authorization: `Bearer ${HEADERS_TOKEN}`,
          Email: mail,
        },
      });

      return response.data;
    } catch (error) {
      console.log('ERROR EN LA BUSQUEDA DEL SERIALIZER', error);
      return null;
    }
  }
  async googleLogin(userPayload: PayloadGoogleType) {
    try {
      const user = await axios(`${USER_URL}/users/mail`, {
        headers: {
          Authorization: `Bearer ${HEADERS_TOKEN}`,
          Email: userPayload.email,
        },
      });

      const payload: JwtPayload = {
        sub: user.data.id,
        role: user.data.role,
        aud: user.data.mail,
      };
      return this.jwtService.sign(payload);
    } catch (error) {
      const token = await this.googleRegister(userPayload);
      if (!token) throw new BadRequestException(error.response.data);
      return token;
    }
  }

  async googleRegister(userPayload: PayloadGoogleType) {
    try {
      const newUser = {
        name: userPayload.name,
        email: userPayload.email,
        image: userPayload.image_url,
      };
      const axiosResponse = await axios.post(
        `${USER_URL}/users/register/google`,
        newUser,
      );

      const payload: JwtPayload = {
        sub: axiosResponse.data.id,
        role: axiosResponse.data.role,
        aud: axiosResponse.data.mail,
      };
      this.authClient.emit(
        { cmd: 'createMailWelcome' },
        {
          email: newUser.email,
          name: newUser.name,
        },
      );
      return this.jwtService.sign(payload);
    } catch (error) {
      throw new BadRequestException(error.response.data);
    }
  }
  async sendmail() {
    this.authClient.emit(
      { cmd: 'createMailWelcome' },
      {
        email: 'ema.cuello1010@gmail.com',
        name: 'Emanuel',
      },
    );

    return 'Enviado';
  }
}
