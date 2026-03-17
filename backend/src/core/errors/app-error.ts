export abstract class AppError {
  abstract message: string
}

export class ResourceNotFoundError extends AppError {
  message = 'Resource not found'
}

export class NotAllowedError extends AppError {
  message = 'Not allowed'
}
