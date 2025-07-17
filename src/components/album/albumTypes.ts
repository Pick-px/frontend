export interface AlbumItemData {
  image_url: string;
  title: string;
  type: string;
  created_at: string;
  ended_at: string;
  size_x: number;
  size_y: number;
  participant_count: number;
  total_try_count: number;
  top_try_user_name?: string;
  top_try_user_count?: number;
  top_own_user_name?: string;
  top_own_user_count?: number;
}
