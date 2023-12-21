import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as argon from "argon2";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { Tokens } from "./types";
import { LoggerService } from "src/logger/logger.service";
import { HttpService } from "@nestjs/axios";
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly httpService: HttpService
  ) {}

  /** 구글 oauth 로그인 */
  async googleLogin(req: Request): Promise<any> {
    try {
      const user = req.user;
      const tokens = await this.signToken(user["user_id"], user["user_email"]);
      await this.updateRtHash(user["user_id"], tokens.refresh_token);
      return tokens;
    } catch (error) {
      this.logger.error("Google login error:", error);
      throw new ForbiddenException("Google login failed");
    }
  }
  /** -------------------- */

  /** 카카오 oauth 로그인 */
  async kakaoLogin(req: Request): Promise<any> {
    try {
      const user = req.user;
      const tokens = await this.signToken(user["user_id"], user["user_email"]);
      await this.updateRtHash(user["user_id"], tokens.refresh_token);
      return tokens;
    } catch (error) {
      this.logger.error("Kakao login error:", error);
      throw new ForbiddenException("Kakao login failed");
    }
  }
  /** -------------------- */

  /** 네이버 oauth 로그인 */
  async naverLogin(req: Request): Promise<any> {
    try {
      const user = req.user;
      const tokens = await this.signToken(user["user_id"], user["user_email"]);
      await this.updateRtHash(user["user_id"], tokens.refresh_token);
      return tokens;
    } catch (error) {
      this.logger.error("Naver login error:", error);
      throw new ForbiddenException("Naver login failed");
    }
  }
  /** -------------------- */

  /** 토큰에 사인 */
  async signToken(userId: number, user_email: string): Promise<Tokens> {
    try {
      const payload = {
        sub: userId,
        user_email: user_email,
      };
      const at_secret = await this.config.get("AT_SECRET");
      const rt_secret = await this.config.get("RT_SECRET");
      const [at, rt] = await Promise.all([
        this.jwt.signAsync(payload, {
          expiresIn: "60m",
          secret: at_secret,
        }),
        this.jwt.signAsync(payload, {
          expiresIn: "7d",
          secret: rt_secret,
        }),
      ]);
      return { access_token: at, refresh_token: rt };
    } catch (error) {
      this.logger.error("Sign token error:", error);
      throw new ForbiddenException("Token signing failed");
    }
  }
  /** -------------------- */

  /** 로그아웃 */
  async logout(userId: number): Promise<any> {
    try {
      const result = await this.prisma.user.updateMany({
        where: {
          user_id: userId["sub"],
          user_refresh_token: {
            not: null,
          },
        },
        data: {
          user_refresh_token: null,
        },
      });
      return result;
    } catch (error) {
      this.logger.error("Logout error:", error);
      throw new ForbiddenException("Logout failed");
    }
  }
  /** -------------------- */

  /** 리프레시 토큰을 사용하여 엑세스토큰 재발급 */
  async refreshTokens(userId: number, rt: any): Promise<Tokens> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          user_id: userId,
        },
      });
      if (!user || !user.user_refresh_token) {
        throw new ForbiddenException("Access Denied");
      }
      // this.logger.log("refreshTokens", user.user_refresh_token);
      // this.logger.log("refreshTokens", rt.refreshToken);
      const rtMatches = await argon.verify(
        user.user_refresh_token,
        rt.refreshToken
      );

      if (!rtMatches) {
        this.logger.log("rtMatches", "Access Denied");
        throw new ForbiddenException("Access Denied");
      }

      const tokens = await this.signToken(user.user_id, user.user_email);
      await this.updateRtHash(user.user_id, tokens.refresh_token);
      return tokens;
    } catch (error) {
      this.logger.error("Refresh tokens error:", error);
      throw new ForbiddenException("Token refresh failed");
    }
  }
  /** -------------------- */

  /** 회원 탈퇴 */
  async revokeAccount(userId) {
    try {
      // 사용자 정보 가져오기
      const user = await this.prisma.user.findFirst({
        where: {
          user_id: userId,
        },
        select: { user_oauth_token: true, user_oauth_provider: true },
      });
      // 토큰이 없으면 종료
      if (!user || !user.user_oauth_token) {
        throw new NotFoundException("사용자 토큰을 찾을 수 없습니다.");
      }
      const oauthToken = user.user_oauth_token;
      let status;
      switch (user.user_oauth_provider) {
        case "google":
          status = await this.revokeGoogleAccount(oauthToken);
          break;
        case "naver":
          status = await this.revokeNaverAccount(oauthToken);
          break;
        default:
          throw new Error("지원되지 않는 OAuth 공급자입니다.");
      }
      // 유저 삭제여부 업데이트
      await this.changeUserStateDelete(userId);
      return status;
    } catch (error) {
      throw error;
    }
  }

  /** -------------------- */
  async changeUserStateDelete(userId) {
    await this.prisma.user.update({
      where: { user_id: userId, user_is_deleted: false },
      data: {
        user_is_deleted: true,
        user_email: "deleted",
        user_nickname: "탈퇴한사용자",
        user_refresh_token: null,
        user_delete_at: new Date(),
      },
    });
  }
  /** -------------------- */

  /** 구글 oauth 해제 */
  // https://developers.google.com/identity/protocols/oauth2/web-server?hl=ko#tokenrevoke
  // https://developers.google.com/identity/account-linking/unlinking?hl=ko
  async revokeGoogleAccount(oauthToken) {
    try {
      const googleClientId = await this.config.get("GOOGLE_OAUTH_ID");
      const googleClientSecret = await this.config.get("GOOGLE_OAUTH_SECRET");
      const postData = `client_id=${googleClientId}&client_secret=${googleClientSecret}&token=${oauthToken}`;
      // this.logger.log("revokeGoogleAccount", postData);
      const postOptions = {
        url: "https://oauth2.googleapis.com/revoke",
        method: "POST",
        port: "443",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
        data: postData,
      };
      const httpService = new HttpService();
      const response = await httpService
        .post(postOptions.url, postData, {
          headers: postOptions.headers,
        })
        .toPromise();
      return response.status;
    } catch (error) {
      this.logger.error("revokeGoogleAccount 에러:", error);
      throw new HttpException(
        "Google OAuth 토큰 취소 중 오류가 발생했습니다.",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
  /** -------------------- */

  /** 네이버 oauth 해제 */
  // https://developers.naver.com/docs/login/devguide/devguide.md#5-3-%EB%84%A4%EC%9D%B4%EB%B2%84-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EC%97%B0%EB%8F%99-%ED%95%B4%EC%A0%9C
  async revokeNaverAccount(oauthToken) {
    try {
      // 클라이언트 ID와 비밀번호를 안전하게 가져옵니다.
      const naverClientID = await this.config.get("NAVER_CLIENT_ID");
      const naverClientSecret = await this.config.get("NAVER_CLIENT_PW");

      // URL 인코딩을 적용합니다.
      const encodedToken = encodeURIComponent(oauthToken);

      // POST 요청 데이터 구성
      const postData = `grant_type=delete&client_id=${naverClientID}&client_secret=${naverClientSecret}&access_token=${encodedToken}&service_provider=NAVER`;

      const postOptions = {
        url: "https://nid.naver.com/oauth2.0/token",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: postData,
      };

      const httpService = new HttpService();
      const response = await httpService
        .post(postOptions.url, postData, {
          headers: postOptions.headers,
        })
        .toPromise();
        // this.logger.log(response.data);
      // 추가적인 유효성 검사를 수행할 수 있습니다.
      if (response.data && response.data.result === 'success') {
        // 성공적으로 처리된 경우
        return response.data;
      } else {
        // 예상치 못한 응답이 있는 경우
        throw new Error('Unexpected response from Naver OAuth service.');
      }
    } catch (error) {
      this.logger.error("revokeNaverAccount 에러:", error);

      // 에러 유형에 따라 다른 처리를 할 수 있습니다.
      if (error instanceof HttpException) {
        // HTTP 관련 예외 처리
        throw new HttpException(
          "Naver OAuth 토큰 취소 중 네트워크 오류가 발생했습니다.",
          HttpStatus.SERVICE_UNAVAILABLE
        );
      } else {
        // 기타 예외 처리
        throw new Error("Naver OAuth 토큰 취소 중 오류가 발생했습니다.");
      }
    }
  }
  /** -------------------- */

  /** 리프레시 토큰을 데이터베이스에 업데이트 */
  async updateRtHash(userId: number, rt: string): Promise<void> {
    try {
      // this.logger.log("updateRtHash", rt);
      const hash = await argon.hash(rt);
      await this.prisma.user.update({
        where: {
          user_id: userId,
        },
        data: {
          user_refresh_token: hash,
        },
      });
    } catch (error) {
      this.logger.error("Update refresh token hash error:", error);
      throw new ForbiddenException("Refresh token update failed");
    }
  }

  /** -------------------- */

  /** Oauth 토큰 암호화 */
  // async hashingOauthToken(oauthAccessToken: string): Promise<string> {
  //   try {
  //     return await argon.hash(oauthAccessToken);
  //   } catch (error) {
  //     this.logger.error("hashing oauth token hash error:", error);
  //     throw new ForbiddenException("hashing token update failed");
  //   }
  // }
  /** -------------------- */

  /** Oauth 토큰 업데이트 */
  async updateOauthToken(userId: number, OauthToken: string): Promise<void> {
    try {
      console.log("updateOauthTokenHash", OauthToken);
      await this.prisma.user.update({
        where: {
          user_id: userId,
        },
        data: {
          user_oauth_token: OauthToken,
        },
      });
    } catch (error) {
      this.logger.error("Update oauth token hash error:", error);
      throw new ForbiddenException("oauth token update failed");
    }
  }
  /** -------------------- */
}
