import { Resolver, Query } from 'type-graphql'
import { User } from './user.entity'
import { UserService } from './user.service'
import { Service } from 'typedi'

@Resolver(() => User)
@Service()
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => [User], { description: 'query user' })
  async users(): Promise<User[]> {
    return await this.userService.queryUser()
  }
}
