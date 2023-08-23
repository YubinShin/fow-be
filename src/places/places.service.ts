import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosResponse } from "axios";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PlacesService {
  private readonly clientID: string;

  constructor(private config: ConfigService, private prisma: PrismaService) {
    this.clientID = this.config.get("KAKAO_CLIENT_ID");
  }

  async findManyPlacesFromKakao(query: string): Promise<any> {
    const api_url = `https://dapi.kakao.com/v2/local/search/keyword`;
    const options = {
      headers: {
        Authorization: "KakaoAK " + this.clientID,
      },
      params: {
        query: query,
        radius: 100,
        size: 15,
      },
    };
    try {
      const response: AxiosResponse<any> = await axios.get(api_url, options);
      return {
        response: response.data,
      };
    } catch (error) {
      throw new Error(`findPlaceInfoFromKakao: 카카오에서 해당 장소 검색 실패`);
    }
  }

  async findPlaceInfoFromKakao(query: string, x: any, y: any): Promise<any> {
    const api_url = `https://dapi.kakao.com/v2/local/search/keyword`;
    const options = {
      headers: {
        Authorization: "KakaoAK " + this.clientID,
      },
      params: {
        y: y,
        x: x,
        query: query,
        radius: 100,
        size: 3,
      },
    };
    try {
      const response: AxiosResponse<any> = await axios.get(api_url, options);
      const place_address = this.addAddress(response.data.documents[0]);
      const place_category = this.setCategory(response.data.documents[0]);
      console.log(
        "🚀 ~ file: places.service.ts:54 ~ PlacesService ~ findPlaceInfoFromKakao ~ place_category:",
        place_category
      );
      return {
        response: response.data,
        place_address: place_address,
        place_category: place_category,
      };
    } catch (error) {
      throw new Error(`findPlaceInfoFromKakao: 카카오에서 해당 장소 검색 실패`);
    }
  }

  checkQueryInResponsePlaces(response: any, query: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const isQueryIncluded = response.documents.some((doc) =>
        doc.place_name.includes(query)
      );

      const isMetaKeywordIncluded =
        response.meta.same_name.keyword.includes(query);

      if (isQueryIncluded || isMetaKeywordIncluded) {
        // console.log(`"${query}" 문자열이 응답 데이터 안에 포함되어 있습니다.`);
        resolve(response);
      } else {
        const errorMessage = `checkQueryInResponsePlaces: "${query}" 문자열이 응답 데이터 안에 포함되어 있지 않습니다.`;
        console.error(errorMessage);
        reject(new Error(errorMessage)); // 에러 발생 시 에러를 내보냅니다.
      }
    });
  }

  addAddress(payload: any): string {
    try {
      return payload.road_address_name || payload.address_name || "";
    } catch (error) {
      const errorMessage = `addAddress 에러: ${error.message}`;
      console.error(errorMessage);
      throw new Error(errorMessage); // 에러 발생 시 에러를 내보냅니다.
    }
  }
  setCategory(payload: any): number[] | undefined {
    try {
      const categoryMappings = {
        음식점: 2,
        "스포츠,레저": 3,
        미술관: 4,
        문화유적: 5,
        기념관: 5,
        전시관: 5,
        카페: 6,
        // ... 여기에 추가적인 카테고리와 매핑을 추가할 수 있습니다.
      };

      let categoryNames = [];
      if (typeof payload.category_name === "string") {
        categoryNames.push(payload.category_name);
      } else if (Array.isArray(payload.category_name)) {
        categoryNames = payload.category_name;
      }

      const matchingCategories = [];

      for (const categoryName of categoryNames) {
        if (categoryMappings.hasOwnProperty(categoryName)) {
          matchingCategories.push(categoryMappings[categoryName]);
        }
      }

      console.log(
        "🚀 ~ file: places.service.ts:106 ~ PlacesService ~ setCategory ~ matchingCategories:",
        matchingCategories
      );

      return matchingCategories.length > 0 ? matchingCategories : undefined;
    } catch (error) {
      console.error("setCategory 에러:", error);
      return undefined; // 에러 발생 시 undefined 반환
    }
  }

  async createPlace(
    place_name: string,
    place_latitude: number,
    place_longitude: number
  ) {
    try {
      const { response, place_address, place_category } =
        await this.findPlaceInfoFromKakao(
          place_name,
          place_latitude,
          place_longitude
        );
      await this.checkQueryInResponsePlaces(response, place_name);
      const createData: any = {
        place_name: place_name,
        place_latitude: place_latitude,
        place_longitude: place_longitude,
        place_address: place_address,
        place_category_map: {
          create: [
            {
              category: {
                connect: {
                  category_id: 1, // 항상 1 부여
                },
              },
            },
            // 음식점인 경우에만 2 부여
            place_category === 2
              ? {
                  category: {
                    connect: {
                      category_id: 2,
                    },
                  },
                }
              : null,
          ].filter(Boolean), // 빈 객체 제거
        },
      };

      const createdPlace = await this.prisma.place.create({
        data: createData,
        include: {
          place_category_map: true, // Include the created map entry
        },
      });

      if (!createdPlace) {
        throw new Error(
          `createPlace: 장소 생성 실패 - 데이터베이스에 새 장소가 생성되지 않았습니다.`
        );
      }
      console.log(
        "🚀 ~ file: places.service.ts:172 ~ PlacesService ~ createdPlace:",
        createdPlace
      );
      return createdPlace;
    } catch (error) {
      throw new Error(`createPlace: 장소 생성 실패 - ${error.message}`);
    }
  }

  async getAll() {
    const result = await this.prisma.place.findMany({});
    // console.log(result);
    return result;
  }
  async getOne(placeId: number) {
    const result = await this.prisma.place.findFirst({
      where: { place_id: placeId },
      include: {
        place_posts: true, // Include related posts
        place_category_map: {
          include: {
            category: true, // Include related category with its name
          },
        },
        place_visited_by: true,
      },
    });
    return result;
  }
}
