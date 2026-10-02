import { PipeTransform, BadRequestException } from '@nestjs/common'
import { ZodSchema } from 'zod'

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value)
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      const firstMessage = Object.values(fieldErrors).flat()[0]
      throw new BadRequestException(
        firstMessage ?? 'Dados inválidos. Verifique os campos informados.',
      )
    }
    return result.data
  }
}
