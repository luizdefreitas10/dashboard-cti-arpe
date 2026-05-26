import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { z } from 'zod';
import { CreateAgendaReuniaoUseCase } from '@/domain/agenda/application/use-cases/create-agenda-reuniao';
import { ListAgendaReunioesUseCase } from '@/domain/agenda/application/use-cases/list-agenda-reunioes';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { AgendaReuniaoPresenter } from '../presenters/agenda-reuniao-presenter';

const hourSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Informe a hora no formato HH:mm');

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(100).default(25),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
  local: z.string().optional(),
  busca: z.string().optional(),
  ordem: z.enum(['asc', 'desc']).default('desc'),
});

const createSchema = z
  .object({
    tema: z.string().trim().min(1, 'Informe o tema da reunião'),
    data: z.coerce.date(),
    horaInicio: hourSchema,
    horaFim: hourSchema,
    local: z.string().trim().min(1, 'Informe o local da reunião'),
    descricaoPauta: z.string().trim().optional(),
  })
  .refine((value) => value.horaFim > value.horaInicio, {
    message: 'A hora de fim deve ser maior que a hora de início',
    path: ['horaFim'],
  });

type QueryParams = z.infer<typeof querySchema>;
type CreateBody = z.infer<typeof createSchema>;

@Controller('agenda/reunioes')
export class AgendaController {
  constructor(
    private listAgendaReunioesUseCase: ListAgendaReunioesUseCase,
    private createAgendaReuniaoUseCase: CreateAgendaReuniaoUseCase,
  ) {}

  @Get()
  async list(@Query(new ZodValidationPipe(querySchema)) query: QueryParams) {
    const result = await this.listAgendaReunioesUseCase.execute(query);
    if (result.isLeft())
      return {
        reunioes: [],
        total: 0,
        page: query.page,
        size: query.size,
        totalPages: 0,
      };

    const { reunioes, total } = result.value;
    return {
      reunioes: reunioes.map((reuniao) =>
        AgendaReuniaoPresenter.toHTTP(reuniao),
      ),
      total,
      page: query.page,
      size: query.size,
      totalPages: Math.ceil(total / query.size),
    };
  }

  @Post()
  async create(@Body(new ZodValidationPipe(createSchema)) body: CreateBody) {
    const result = await this.createAgendaReuniaoUseCase.execute(body);

    if (result.isLeft()) {
      throw new BadRequestException('Não foi possível registrar a reunião');
    }

    return {
      reuniao: AgendaReuniaoPresenter.toHTTP(result.value.reuniao),
    };
  }
}
