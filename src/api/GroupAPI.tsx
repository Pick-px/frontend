// src/services/canvasService.ts

import apiClient from '../services/apiClient';

export const groupServices = {
  /***
   * 캔버스에 해당하는 그룹의 전체 목록을 불러옵니다.
   * @param canvasId : 현재 캔버스의 id
   */
  async getGroupList(canvasId: string) {
    try {
      const response = await apiClient.get(`/group/list`, {
        params: { canvas_id: canvasId },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch getGroupList ${canvasId}:`, error);
      throw error;
    }
  },

  /**
   * 입력한 그룹명으로 검색한 그룹 목록을 조회합니다.
   * @param groupName : 검색할 그룹의 제목
   */
  async searchGroups(groupName: string, canvas_id: string) {
    try {
      const response = await apiClient.get(`/group/search`, {
        params: { groupName: groupName, canvas_id: canvas_id },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch searchGroups ${groupName}:`, error);
      throw error;
    }
  },

  /**
   * 입력받은 제목과 그룹 인원으로 그룹을 생성합니다.
   * @param title : 그룹 제목
   * @param maxMumber - 그룹 최대 인원
   */
  async createGroup(title: string, maxMumber: string, canvas_id: string) {
    try {
      const response = await apiClient.post('/group/create', {
        name: title,
        maxParticipants: maxMumber,
        canvasId: canvas_id,
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch create group ${title}:`, error);
      throw error;
    }
  },

  /**
   * 선택한 그룹에 참여를 신청합니다.
   * @param groupId 참여할 그룹 ID
   * @returns
   */
  async joinGroup(groupId: string) {
    try {
      const response = await apiClient.post(`/group/join`, {
        group_id: groupId,
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(`Failed to join group ${groupId}:`, error);
      throw error;
    }
  },

  async deleteGroup(groupId: string) {
    try {
      const response = await apiClient.delete(`/group/quit`, {
        data: { group_id: groupId },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(`Failed to join group ${groupId}:`, error);
      throw error;
    }
  },

  // 나중에 캔버스 저장, 삭제 등 다른 API가 생기면 여기에 추가합니다.
};
