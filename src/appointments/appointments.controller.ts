import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UnauthorizedException,
  Put,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Headers('Authorization') token: string,
  ) {
    const currentUser = token?.split(' ')[1];
    if (!currentUser) throw new UnauthorizedException('No tienes permisos');
    return this.appointmentsService.create(createAppointmentDto, currentUser);
  }

  @Get()
  findAll(@Headers('Authorization') token: string) {
    const currentUser = token?.split(' ')[1];
    if (!currentUser) throw new UnauthorizedException('No tienes permisos');
    return this.appointmentsService.findAll(currentUser);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('Authorization') token: string) {
    const currentUser = token?.split(' ')[1];
    return this.appointmentsService.findOne(Number(id), currentUser);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Headers('Authorization') token: string,
  ) {
    const currentUser = token?.split(' ')[1];
    if (!currentUser) throw new UnauthorizedException('No tienes permisos');
    return this.appointmentsService.update(
      Number(id),
      updateAppointmentDto,
      currentUser,
    );
  }
}