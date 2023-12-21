// place.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class Post {
  @ApiProperty()
  post_id: number;

  @ApiProperty()
  post_created_at: string;

  @ApiProperty()
  post_updated_at: string;

  @ApiProperty()
  post_description: string;

  @ApiProperty()
  post_image_url: string;

  @ApiProperty()
  post_author_id: number;

  @ApiProperty({ type: Number })
  post_star_rating: number;

  @ApiProperty({ type: Number })
  post_place_id: number;

  @ApiProperty()
  post_is_deleted: boolean;
}

export class landmarksResponse {
  @ApiProperty()
  place_id: number;

  @ApiProperty()
  place_created_at: string;

  @ApiProperty()
  place_updated_at: string;

  @ApiProperty()
  place_name: string;

  @ApiProperty()
  place_star_rating: number | null;

  @ApiProperty()
  place_points: number | null;

  @ApiProperty()
  place_address: string;

  @ApiProperty()
  place_region_id: number;

  @ApiProperty()
  place_latitude: number;

  @ApiProperty()
  place_longitude: number;
  
  @ApiProperty()
  place_posts: Post[];
}
