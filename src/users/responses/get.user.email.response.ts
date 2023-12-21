import { ApiProperty } from "@nestjs/swagger";

export class GetUserEmailResponse {
  @ApiProperty()
  user_email: string;
}
