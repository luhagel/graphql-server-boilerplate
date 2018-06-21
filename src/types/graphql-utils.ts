import { Redis } from "ioredis";

export interface ResolverMap {
  [key: string]: {
    [key: string]: Resolver
  }
}

export interface Context {
  redis: Redis,
  url: string,
  session: Session,
  req: Express.Request
}

export type Resolver = (
  parent: any,
  args: any,
  context: Context,
  info: any
) => any

export type GraphQLMiddlewareFunc = (
  resolverFunc: Resolver,
  parent: any,
  args: any,
  context: Context,
  info: any
) => any

export interface Session extends Express.Session {
  userId?: string
}