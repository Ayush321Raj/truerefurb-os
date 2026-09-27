import { Injectable, NotFoundException } from '@nestjs/common';
import { DeviceItem, WorkflowStage } from '@truerefurb/shared-types';

@Injectable()
export class DevicesService {
  private devices: DeviceItem[] = [];

  findAll(stage?: WorkflowStage) {
    if (stage) {
      return this.devices.filter((d) => d.stage === stage);
    }
    return this.devices;
  }

  findOne(id: string) {
    const device = this.devices.find((d) => d.id === id);
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    return device;
  }

  create(dto: any) {
    const now = new Date().toISOString();
    const acquisitionCost = Number(dto.acquisitionCost ?? 0);
    const repairCost = Number(dto.repairCost ?? 0);
    const otherCost = Number(dto.otherCost ?? 0);
    const targetResalePrice = Number(dto.targetResalePrice ?? dto.sellingPrice ?? 0);
    const currentStatus = dto.status || 'RECEIVED';

    const newDevice: DeviceItem = {
      id: `dev-${Date.now()}`,
      organizationId: dto.organizationId || 'TEN-001',
      imei1: dto.imei1 || dto.imei || `990000${Date.now()}`,
      serialNumber: dto.serialNumber || `SN-${Date.now()}`,
      brand: dto.brand || dto.make || 'Apple',
      model: dto.model || 'Generic Device',
      variant: dto.variant || 'Standard',
      storage: dto.storage || '128GB',
      ram: dto.ram || '6GB',
      color: dto.color || 'Black',
      condition: dto.condition || 'Refurbished',
      grade: dto.grade || 'GRADE_B',
      batteryHealth: Number(dto.batteryHealth ?? 92),
      purchaseCost: acquisitionCost,
      repairCost,
      otherCost,
      totalCost: acquisitionCost + repairCost + otherCost,
      sellingPrice: targetResalePrice,
      status: currentStatus,
      currentLocation: dto.currentLocation || 'AUS-HUB-04 / Intake Dock',
      warehouseId: dto.warehouseId || 'AUS-HUB-04',
      warehouseName: dto.warehouseName || 'Austin Hub',
      createdAt: now,
      updatedAt: now,
      stage: dto.stage || 'INTAKE',
      make: dto.make || 'Apple',
      category: dto.category || 'SMARTPHONE',
      conditionGrade: dto.conditionGrade || 'GRADE_B',
      functionalScore: Number(dto.functionalScore ?? 90),
      acquisitionCost,
      targetResalePrice,
      source: dto.source || 'CARRIER_TRADE_IN',
      activeChannels: ['AMAZON_RENEWED', 'BACK_MARKET'],
      repairs: [],
      estimatedMargin: targetResalePrice - acquisitionCost,
      intakeDate: now,
      warehouseBay: dto.warehouseBay || 'A01',
      warehouseLocation: dto.warehouseLocation || 'Intake Dock',
      assignedTechnician: dto.assignedTechnician,
      diagnosticReport: dto.diagnosticReport,
      binNumber: dto.binNumber,
      imei: dto.imei || `990000${Date.now()}`,
    };

    this.devices.unshift(newDevice);
    return newDevice;
  }

  advanceStage(id: string) {
    const stages: WorkflowStage[] = [
      'INTAKE',
      'DIAGNOSTICS',
      'REPAIR_BENCH',
      'CLEANING_POLISH',
      'QA_INSPECTION',
      'READY_FOR_SALE'
    ];

    const device = this.findOne(id);
    const currIdx = stages.indexOf(device.stage);
    if (currIdx !== -1 && currIdx < stages.length - 1) {
      device.stage = stages[currIdx + 1];
      device.functionalScore = Math.min(100, device.functionalScore + 5);
    }
    return device;
  }
}
