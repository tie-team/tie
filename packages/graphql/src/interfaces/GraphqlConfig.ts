import { GraphQLScalarType } from 'graphql'
import { PubSubEngine, PubSubOptions } from 'graphql-subscriptions'

// type Directive = () => Promise<any> | any
export interface ScalarsMapItem {
  type: any
  scalar: GraphQLScalarType
}

export interface GraphqlConfig {
  path?: string
  dateScalarMode?: 'isoDate' | 'timestamp'
  scalarsMap?: ScalarsMapItem[]
  cors?: boolean
  resolvers?: any[]
  debug?: boolean
  typeDefs?: string
  directives?: {
    [name: string]: any
  }

  pubSub?: PubSubEngine | PubSubOptions
  emitSchemaFile?: boolean
}
