import { LikeStatusEnum } from "../../../enums/likes.enum";
import { Comment } from "../../entity/comment.entity.typeorm";

export type CommentQueryRepoType = Comment & {
  userLogin: string;
  likesCount?: string;
  dislikesCount?: string;
  myStatus?: LikeStatusEnum;
};

export class CommentViewDtoTypeorm {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };

  static mapToView(comment: CommentQueryRepoType): CommentViewDtoTypeorm {
    const viewComment = new CommentViewDtoTypeorm();

    viewComment.id = comment.id;
    viewComment.content = comment.content;
    viewComment.commentatorInfo = {
      userId: comment.userAccountId,
      userLogin: comment.userLogin,
    };
    viewComment.createdAt = comment.createdAt;
    viewComment.likesInfo = {
      likesCount: Number(comment.likesCount) || 0,
      dislikesCount: Number(comment.dislikesCount) || 0,
      myStatus: comment.myStatus || LikeStatusEnum.None,
    };

    return viewComment;
  }
}
