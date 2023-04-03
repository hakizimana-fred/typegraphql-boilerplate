import { MyContext } from "src/types/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { User } from "@generated/type-graphql";

@InputType()
class usernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User | null;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: usernamePasswordInput,
    @Ctx() { prisma }: MyContext
  ): Promise<UserResponse> {
    const { username, password } = options;
    if (username.length < 2) {
      return {
        errors: [{ field: "Username", message: "Username too small" }],
      };
    }

    if (password.length < 6) {
      return {
        errors: [{ field: "Password", message: "Password too small" }],
      };
    }
    const hashedPassword = await argon2.hash(password);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return {user}
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: usernamePasswordInput,
    @Ctx() { prisma } : MyContext
  ): Promise<UserResponse> {
      const { username, password } = options;
    if (username.length < 2) {
      return {
        errors: [{ field: "Username", message: "Username too small" }],
      };
    }

    if (password.length < 6) {
      return {
        errors: [{ field: "Password", message: "Password too small" }],
      };
    }

    const user = await prisma.user.findFirst({where: {username}})
    if (!user){
        return {
            errors: [{field: "User", message: "Invalid credentials"}]
        }
    }
    const validPassword = await argon2.verify(user.password, password)
    if (!validPassword) {
        return {
            errors: [{field: "Authentication", message: "Invalid credentials"}]
        }
    }
    return { user }
  }


}
