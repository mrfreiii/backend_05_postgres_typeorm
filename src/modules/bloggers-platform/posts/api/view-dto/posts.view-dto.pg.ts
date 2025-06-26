import { Post } from "../../entity/post.entity.typeorm";
import { LikeStatusEnum } from "../../../enums/likes.enum";
import { NewestLikesPg } from "../../../types/likes.types";

export type PostQueryRepoType = Post & {
  blogName: string;
  likesCount?: string;
  dislikesCount?: string;
  myStatus?: LikeStatusEnum;
  newestLikes?: NewestLikesPg[];
};

export class PostViewDtoTypeorm {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes: NewestLikesPg[] | [];
  };

  static mapToView(post: PostQueryRepoType): PostViewDtoTypeorm {
    const viewPost = new PostViewDtoTypeorm();

    viewPost.id = post.id;
    viewPost.title = post.title;
    viewPost.shortDescription = post.shortDescription;
    viewPost.content = post.content;
    viewPost.blogId = post.blogId;
    viewPost.blogName = post.blogName;
    viewPost.createdAt = post.createdAt;
    viewPost.extendedLikesInfo = {
      likesCount: Number(post.likesCount) || 0,
      dislikesCount: Number(post.dislikesCount) || 0,
      myStatus: post.myStatus || LikeStatusEnum.None,
      newestLikes: post.newestLikes || [],
    };

    return viewPost;
  }
}
