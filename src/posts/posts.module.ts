import { Module } from "@nestjs/common";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PlacesService } from "src/places/places.service";
import { BadgesService } from "src/badges/badges.service";
import { PointsService } from "src/points/points.service";
import { LevelsService } from "src/levels/levels.service";
import { UsersService } from "src/users/users.service";
import { RanksModule } from "src/ranks/ranks.module";

@Module({
  imports: [PrismaModule, RanksModule],
  controllers: [PostsController],
  providers: [
    PostsService,
    PlacesService,
    BadgesService,
    PointsService,
    LevelsService,
    UsersService,
  ],
})
export class PostsModule {}
