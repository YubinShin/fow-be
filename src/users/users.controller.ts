import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Patch,
  Res,
  UnprocessableEntityException,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
// import { User } from "@prisma/client";
import { GetCurrentUserInfo, GetUser } from "../auth/decorator";
import { ATGuard, JwtGuard } from "../auth/guard";
import { UsersService } from "./users.service";
import { ChangeUserTitleDto, EditUserDto } from "./dto";
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  ApiOperation,
} from "@nestjs/swagger";
import { validate } from "class-validator";
import {
  EditUserResponse,
  GetUserBadgeResponse,
  GetUserEmailResponse,
  GetUserResponse,
  RegionWithVisitedCountDto,
} from "./responses";
import { LoggerService } from "src/logger/logger.service";
import {
  CACHE_MANAGER,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from "@nestjs/cache-manager";
import { UserSubCheckInterceptor } from "src/common/interceptor";

@UseInterceptors(UserSubCheckInterceptor)
@ApiTags("users")
@UseGuards(ATGuard)
@Controller("users")
export class UsersController {
  constructor(
    private userService: UsersService,
    private logger: LoggerService
  ) {}
  /** -------------------- */

  /** 나의 정보 가져오기/ 마이페이지, 메인페이지 사용 */
  @Get("me")
  @ApiOperation({ summary: "나의 정보 가져오기/ 마이페이지, 메인페이지 사용" })
  @ApiBearerAuth("access_token")
  @ApiResponse({
    status: 200,
    description: "",
    type: GetUserResponse,
  })
  async getMe(@GetCurrentUserInfo() user) {
    this.logger.log("UsersController 자신의 회원정보 호출한 사람", user["sub"]);
    const result = await this.userService.findUserById(user["sub"]);
    this.logger.log("UsersController 자신의 회원정보 호출 결과\n", { user_id : result.user_id, user_nickname : result.user_nickname});
    return result;
  }
  /** -------------------- */

  /** "나의 정보 수정하기 / 프로필이미지, 닉네임, 대표칭호 변경 가능 */
  @Patch("me")
  @UseGuards(ATGuard)
  @ApiOperation({
    summary:
      "나의 정보 수정하기 / 프로필이미지, 닉네임, 대표칭호 변경 가능",
  })
  @ApiBearerAuth("access_token")
  @HttpCode(201)
  @ApiResponse({
    status: 200,
    description: "",
    type: EditUserResponse,
  })
  async editUser(@GetCurrentUserInfo() user, @Body() dto: EditUserDto) {
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorResponse = {
        message: "Validation failed",
        errors: errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints).join(", "),
        })),
      };
      throw new UnprocessableEntityException(errorResponse);
    }
    try {
      console.log(dto);
      await this.userService.editUser(user["sub"], dto);
      this.logger.log(`${user["user_email"]}의 회원 정보 변경`);
      return { message: "유저 정보 변경에 성공했습니다" };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  /** -------------------- */

  /** 내가 소유한 뱃지 가져오기 */
  @Get("me/badges")
  @ApiOperation({ summary: "사용자의 소유한 뱃지 조회" })
  @ApiBearerAuth("access_token")
  @ApiResponse({
    status: 200,
    description: "사용자가 소유한 뱃지 정보",
    type: GetUserBadgeResponse,
  })
  async getMyBadges(@GetCurrentUserInfo() user) {
    const result = await this.userService.findUserBadges(user["sub"]);
    this.logger.log(`${user["user_email"]} 뱃지 정보 호출`);
    return result;
  }
  /** -------------------- */

  /** 나의 이메일 가져오기 */
  @Get("me/email")
  @ApiOperation({ summary: "나의 이메일 조회" })
  @ApiBearerAuth("access_token")
  @ApiResponse({
    status: 200,
    description: "나의 이메일 조회",
    type: GetUserEmailResponse,
  })
  async getMyEmail(@GetCurrentUserInfo() user) {
    this.logger.log(`${user["user_email"]} 이메일 조회 호출`);
    return {user_email : user["user_email"]};
  }
  /** -------------------- */

  /** 나의 칭호 변경하기 */
  @Patch("me/title")
  @ApiOperation({
    summary: "나의 칭호 변경하기",
  })
  @ApiBearerAuth("access_token")
  @HttpCode(201)
  @ApiResponse({
    status: 200,
    description: "",
    type: EditUserResponse, 
  })
  async changeTitle(
    @GetCurrentUserInfo() user,
    @Body() dto: ChangeUserTitleDto,
    @Res() res
  ) {
    try {
      const result = await this.userService.changeTitle(user["sub"], dto);
      this.logger.log(`${user["user_email"]}의 대표 칭호 변경`);
      // return result;
      return res.status(HttpStatus.OK).json({message : "대표 칭호 변경에 성공하였습니다."});
    } catch (error) {
      this.logger.log(error);
    }
  }
  /** -------------------- */

  /** 사용자가 방문한 구역 정보 및 횟수 전달 */
  @Get("me/region")
  @ApiOperation({ summary: "사용자가 방문한 구역 정보 및 횟수 전달" })
  @ApiBearerAuth("access_token")
  @ApiResponse({
    status: 200,
    description: "사용자가 방문한 구역 정보 및 횟수",
    type: [RegionWithVisitedCountDto],
  })
  async getMyVisitedRegionCount(
    @GetCurrentUserInfo() user,
    @Res() res
  ) {
    try {
      const result = await this.userService.getMyVisitedRegionCount(
        user["sub"]
      );
      this.logger.log(
        `user_id : ${user["user_email"]} 구역 정보 및 횟수 조회`
      );
      // this.logger.log(JSON.stringify(result));
      res.status(HttpStatus.OK).json(result.counts);
      return result;
    } catch (err) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "유저정보를 찾을 수 없습니다" });
    }
  }
  /** -------------------- */

  /** DEPRECATED 회원탈퇴 */
  // @Delete("me/leave")
  // @ApiOperation({ summary: "사용자 탈퇴" }) 
  // @ApiBearerAuth("access_token")
  // @ApiResponse({
  //   status: 200,
  //   description: "탈퇴성공",
  // })
  // async leaveService(@GetCurrentUserInfo() user, @Res() res) {
  //   try {
  //     const result = await this.userService.leaveService(user["sub"]);
  //     this.logger.log(`user_id : ${user["user_email"]} 회원탈퇴`);
  //     return res.status(HttpStatus.NO_CONTENT).json(result);
  //   } catch (error) {
  //     this.logger.error(error);
  //     return res
  //       .status(HttpStatus.NOT_FOUND)
  //       .json({ message: "유저정보를 찾을 수 없습니다" });
  //   }
  // }
  /** -------------------- */
}
