import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { WorkflowStage } from '@truerefurb/shared-types';

@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @ApiOperation({ summary: 'List all devices in pipeline' })
  findAll(@Query('stage') stage?: WorkflowStage) {
    return this.devicesService.findAll(stage);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single device by ID' })
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Intake and register a new device' })
  create(@Body() createDeviceDto: any) {
    return this.devicesService.create(createDeviceDto);
  }

  @Patch(':id/advance')
  @ApiOperation({ summary: 'Advance device to the next pipeline stage' })
  advanceStage(@Param('id') id: string) {
    return this.devicesService.advanceStage(id);
  }
}
