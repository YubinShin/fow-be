import { Module } from "@nestjs/common";
import { CategoriesService } from "./categories.service";

@Module({
  controllers: [],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
