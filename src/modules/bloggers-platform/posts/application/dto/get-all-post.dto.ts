import { PostViewDtoTypeorm } from "../../api/view-dto/posts.view-dto.pg";

export class GetLikesStatusesForPostsDto {
  posts: PostViewDtoTypeorm[];
  userId: string | null;
}
