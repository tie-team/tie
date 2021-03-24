import {
  Injectable,
  IPlugin,
  Application,
  RouteItem,
  Container,
  Context,
  InjectApp,
  NextFunction,
  InjectConfig,
} from '@tiejs/common'

import { validateOrReject, ValidationError } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { parse } from 'cookie'
import bodyParser, { Options } from 'koa-bodyparser'

import isPromise from 'is-promise'
import Router from '@koa/router'

import { Exception } from '@tiejs/exception'
import { paramTypes } from './constant'
import { paramStore } from './stores/paramStore'
import { RouteBuilder } from './RouteBuilder'

import { formatError } from './utils/formatError'

interface Arg {
  value: any
  shouldValidate: boolean
}

@Injectable()
export class ControllerPlugin implements IPlugin {
  private routes: RouteItem[] = []

  constructor(@InjectApp() private app: Application, @InjectConfig('body') private body: Options) {
    this.app.use(bodyParser(this.body))
  }

  async appDidReady(app: Application) {
    const routeBuilder = Container.get(RouteBuilder)
    this.routes = routeBuilder.buildRoutes()
    app.routerStore = this.routes
  }

  async middlewareDidReady(app: Application) {
    const router: any = new Router()

    for (const route of this.routes) {
      const { method, path, instance, fn, target, propertyKey, view } = route

      router[method](path, async (ctx: Context, next: any) => {
        const args = getArgs(ctx, next, target, propertyKey)

        const validationErrors = await getValidationErrors(args)

        if (validationErrors.length) {
          // TODO: handle detail
          return next(
            new Exception({
              type: 'ValidationError',
              code: 'ValidationError',
              message: 'Argument Validation Error',
              origin: validationErrors,
            }),
          )
        }

        try {
          let result = fn.apply(
            instance,
            args.map(i => i.value),
          )
          result = isPromise(result) ? await result : result

          // can render
          if (view) return ctx.render(view, result)

          // render result
          if (result) ctx.body = result
        } catch (error) {
          const { status, body } = formatError(error)
          ctx.response.status = status
          ctx.body = body
        }
      })
    }

    app.use(router.routes()).use(router.allowedMethods())
  }
}

function getVaue(ctx: Context, next: NextFunction, paramType: string, paramName: string) {
  const ValueMaps = {
    [paramTypes.Query]: () => (paramName ? ctx.query[paramName] : { ...ctx.query }),
    [paramTypes.Body]: () => (paramName ? ctx.request.body[paramName] : ctx.request.body),
    [paramTypes.Params]: () => (paramName ? ctx.params[paramName] : ctx.params),
    [paramTypes.Cookie]: () => {
      const cookies = parse(ctx.headers.cookie || '') || {}
      return paramName ? cookies[paramName] : cookies
    },
    [paramTypes.Method]: () => ctx.method,
    [paramTypes.Session]: () => ctx.req, // TODO: session
    [paramTypes.Ctx]: () => ctx,
    [paramTypes.Next]: () => next,
    [paramTypes.Req]: () => ctx.req,
    [paramTypes.Res]: () => ctx.res,
    [paramTypes.Header]: () => ctx.headers,
  }
  return (ValueMaps as any)[paramType]()
}

function getArgs(ctx: Context, next: NextFunction, target: Object, propertyKey: string): Arg[] {
  const args: Arg[] = []

  const ParamTypes = paramStore.getParamTypes(target, propertyKey)

  for (const type of Object.values(paramTypes)) {
    const paramMetadata = paramStore.get({
      paramType: type,
      controllerClass: target,
      method: propertyKey,
    })

    if (paramMetadata) {
      for (const paramName of Object.keys(paramMetadata)) {
        let shouldValidate = false
        let value = getVaue(ctx, next, type, paramName)
        const index = paramMetadata[paramName]
        const paramType = ParamTypes[index]

        const builtinTypes = [
          paramTypes.Ctx,
          paramTypes.Req,
          paramTypes.Res,
          paramTypes.Method,
          paramTypes.Next,
        ]

        try {
          if (!builtinTypes.includes(type)) {
            shouldValidate = true
            value = plainToClass(paramType, value)
          }
        } catch {}

        args[paramMetadata[paramName]] = {
          value,
          shouldValidate,
        }
      }
    }
  }
  return args
}

async function getValidationErrors(args: Arg[]) {
  let validationErrors: ValidationError[] = []

  for (const arg of args) {
    try {
      if (arg.shouldValidate) {
        await validateOrReject(arg)
      }
    } catch (errors) {
      if (errors && errors.length) {
        validationErrors = [...validationErrors, ...errors]
      }
    }
  }

  return validationErrors
}
