import { LoggerService } from "src/logger/logger.service";
import { PlacesService } from "./places.service";
import {
  Controller,
  Get,
  Query,
  Res,
  HttpStatus,
  Param,
  ParseIntPipe,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiTags,
  ApiCreatedResponse,
  ApiResponse,
  ApiOperation,
  ApiQuery,
} from "@nestjs/swagger";
import {
  SearchResponse,
  GetPlaceById,
  PlaceWithPostsResponse,
  landmarksResponse,
} from "./responses";
import { UserSubCheckInterceptor } from "src/common/interceptor";
import { PlaceStarRatingInterceptor } from "./interceptor";

@ApiTags("places")
@Controller("places")
@UseInterceptors(PlaceStarRatingInterceptor)
export class PlacesController {
  constructor(
    private readonly placesService: PlacesService,
    private logger: LoggerService
  ) {}

  /** 모든 랜드마크 가져오기 */
  @Get("/landmarks")
  @ApiOperation({ summary: "랜드마크 가져오기/ 탐험 추천 장소" })
  @ApiResponse({
    status: 200,
    description: "랜드마크 목록을 성공적으로 가져왔습니다.",
    type: landmarksResponse,
  })
  async getLandmarks() {
      const result = await this.placesService.getLandmarks();
      return result;
  }
  /** -------------------- */

  /** 개발용 : 간단하게 장소검색하기 */
  // @Get("/simple_search")
  // @ApiOperation({
  //   summary: "간단하게 장소검색하기/ query 필요",
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: "",
  //   type: SearchResponse, // 반환 모델을 지정
  // })
  // @ApiResponse({ status: 404, description: "해당 장소 검색 실패" })
  // async jhPlaceSearch(
  //   @Query("query") query: string,
  // ): Promise<void> {
  //   try {
  //     const searchResult = await this.placesService.findSimplePlacesInfo(query);
  //     return searchResult;
  //   } catch (error) {
  //   }
  // }
  /** -------------------- */

  /** 장소 검색하기
   *
   *  예시 : http://localhost:5000/v1/places/search?x=126.975278&y=37.559722&query=숭례문
   */
  @ApiOperation({
    summary: "장소검색하기/ x,y,query 필요, 현재 주변 3km 검색 가능",
  })
  @ApiResponse({
    status: 200,
    type: SearchResponse,
  })
  @ApiResponse({ status: 404, description: "해당 장소 검색 실패" })
  @ApiQuery({ name: 'query', required: true, example: '코엑스' })
  @ApiQuery({ name: 'x', required: true, example: 127.0588278439012 })
  @ApiQuery({ name: 'y', required: true, example: 37.51266138067201 })
  @Get("/search")
  async getPlaceSearch(
    @Query("query") query: string,
    @Query("x") xCoordinate: number,
    @Query("y") yCoordinate: number,
  ): Promise<any> {
    try {
      this.logger.log(
        `🔍 위도(latitude) : ${yCoordinate}, 경도(longitude) : ${xCoordinate}, 검색어 : ${query}`
      );
      const searchResult: SearchResponse[] =
        await this.placesService.findPlacesInfoFromKakao(
          xCoordinate,
          yCoordinate,
          query
        );
      return searchResult;
    } catch (error) {
    }
  }
  /** -------------------- */

  /**  데이터베이스에 있는 모든 장소 가져오기*/
  @Get("/all")
  @ApiOperation({
    summary: "데이터베이스에 있는 모든 장소 가져오기(랜드마크, 게시장소 포함)",
  })
  @ApiCreatedResponse({
    status: 200,
  })
  async getAllPlaces() {
    try {
      const result = await this.placesService.getAll();
      return result;
      // return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      // res
      //   .status(HttpStatus.NOT_FOUND)
      //   .json({ message: "Error occurred during search." });
    }
  }
  /** -------------------- */

  /** 특정 id 를 가진 장소 가져오기 */
  // @Get("/:id")
  // @ApiOperation({ summary: "특정 id 를 가진 장소 가져오기" })
  // @ApiResponse({
  //   status: 200,
  //   description: "",
  //   type: GetPlaceById,
  // })
  // async getPlace(@Param("id", ParseIntPipe) placeId: number, @Res() res) {
  //   try {
  //     const result: GetPlaceById = await this.placesService.getOne(placeId);
  //     return result;
  //   } catch (error) {
  //     res
  //       .status(HttpStatus.NOT_FOUND)
  //       .json({ message: "Error occurred during search." });
  //   }
  // }
  /** -------------------- */

  /** 특정 id 를 가진 장소의 리뷰를 가져오기 */
  @Get("/:id/posts")
  @ApiOperation({ summary: "특정 id 를 가진 장소의 리뷰를 가져오기" })
  @ApiResponse({
    status: 200,
    description: "",
    type: [PlaceWithPostsResponse],
  })
  async getPlacePosts(@Param("id", ParseIntPipe) placeId: number) {
    try {
      const result = await this.placesService.getPlacePosts(placeId);
      this.logger.log(`장소id (${placeId}) 의 게시물들이 조회됨 `);
      return result;
      // return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      // res
      //   .status(HttpStatus.NOT_FOUND)
      //   .json({ message: "Error occurred during search." });
    }
  }
  /** -------------------- */

   /** 장소 검색하기
   *
   *  예시 : http://localhost:5000/v1/places/search?x=126.975278&y=37.559722&query=숭례문
   */
   @ApiOperation({
    summary: "장소검색하기/ x,y 필요",
  })
  @ApiResponse({
    status: 200,
    type: [SearchResponse],
  })
  @ApiResponse({ status: 404, description: "해당 장소 검색 실패" })
  @ApiQuery({ name: 'x', required: true, example: 127.0588278439012 })
  @ApiQuery({ name: 'y', required: true, example: 37.51266138067201 })
  @Get("/current-xy")
  async findPlacesWithXY(
    @Query("x") xCoordinate: number,
    @Query("y") yCoordinate: number,
  ): Promise<any> {
    try {
      this.logger.log(
        `🔍 위도(latitude) : ${yCoordinate}, 경도(longitude) : ${xCoordinate}`
      );
      const searchResult: SearchResponse[] =
        await this.placesService.findPlacesWithXY(
          xCoordinate,
          yCoordinate
        );

      return searchResult;
    } catch (error) {
    }
  }
}
