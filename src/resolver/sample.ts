import { Query, Resolver } from "type-graphql";

@Resolver()
export class SampleResolver{
    @Query(() => String)
    sayHi() {
        return "Hi Techjork"
    }
}