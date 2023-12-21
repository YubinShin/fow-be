import { ApiProperty } from '@nestjs/swagger';

export class UserBadge {
  @ApiProperty()
  badge_id: number;

  @ApiProperty()
  badge_name: string;

  @ApiProperty()
  badge_category_id: number;

  @ApiProperty()
  badge_criteria: number;

  @ApiProperty()
  badge_points: number;

  @ApiProperty()
  badge_owned_users_id: number | null;

  @ApiProperty()
  badge_image_url: string;
}

export class GetUserBadgeResponse {
    @ApiProperty()
    user_id :number;
    
    @ApiProperty({ type: [UserBadge] })
    user_badges: UserBadge[];

    @ApiProperty({ type: UserBadge })
    user_selected_badge: UserBadge;
}
