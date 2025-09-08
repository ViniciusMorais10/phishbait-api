import { IsEnum } from 'class-validator';

export enum Status {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
export class StatusSimulationDTO {
  @IsEnum(Status, {
    message:
      'Status inválido. Deve ser: PENDING, IN_PROGRESS, COMPLETED ou CANCELED',
  })
  status: Status;
}
