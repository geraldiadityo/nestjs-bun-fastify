import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";

@Catch()
export class ErrorFilter implements ExceptionFilter {
    private readonly logger = new Logger('ErrorFilter');
    
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<FastifyRequest>();
        const response = ctx.getResponse<FastifyReply>();

        const isHttpException = exception instanceof HttpException;
        const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        let errorMessage: unknown;

        const stackTrace = exception instanceof Error ? exception.stack : undefined;

        if (isHttpException) {
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                errorMessage = exceptionResponse
            } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null && "message" in exceptionResponse) {
                errorMessage = (exceptionResponse as Record<string, unknown>).message;
            } else {
                errorMessage = exceptionResponse
            }
        } else {
            errorMessage = exception instanceof Error ? exception.message : "An unexpected error occured"
        }

        const logMessage = `[${request.method}] ${request.url} - Status: ${status} - Error: ${JSON.stringify(errorMessage)}`;

        if (status >= 500) {
            this.logger.error(logMessage, stackTrace);
        } else {
            this.logger.warn(logMessage);
        }

        response.status(status).send({
            message: errorMessage,
            timestamp: new Date().toISOString(),
            path: request.url
        })
    }
}