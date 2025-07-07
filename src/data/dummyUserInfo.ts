import { type UserInfoResponse } from '../services/myPageService';

export const dummyUserInfo: UserInfoResponse = {
  email: 'user@example.com',
  nickName: 'nickname123',
  canvases: [
    {
      title: 'My First Canvas',
      created_at: '2025-01-15T09:30:00Z',
      size_x: 100,
      size_y: 100,
    },
    {
      title: 'Project Artwork',
      created_at: '2025-02-20T14:00:00Z',
      size_x: 200,
      size_y: 150,
    },
  ],
};
