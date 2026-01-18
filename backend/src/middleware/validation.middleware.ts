import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction, RequestHandler } from 'express';

export function validationMiddleware<T>(type: any, skipMissingProperties = false): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        validate(plainToInstance(type, req.body), { skipMissingProperties })
            .then((errors: ValidationError[]) => {
                if (errors.length > 0) {
                    const message = errors.map((error: ValidationError) => Object.values(error.constraints || {})).join(', ');
                    res.status(400).json({ status: 'error', message });
                } else {
                    next();
                }
            });
    };
}
