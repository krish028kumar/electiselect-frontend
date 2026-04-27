import { mockOpenElectives, mockDeptElectives, mockStaffStats, mockStudents } from '../data/mockData';

// Simulated delay for realistic API interactions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  getOpenElectives: async () => {
    await delay(500);
    return mockOpenElectives;
  },
  
  getDeptElectives: async () => {
    await delay(500);
    return mockDeptElectives;
  },

  getMockStudents: async () => {
    await delay(600);
    return mockStudents;
  },

  selectOpenElective: async (subjectCode) => {
    await delay(800);
    // Real implementation would make an axios post call
    return { success: true, message: `Successfully registered for ${subjectCode}` };
  },

  submitDeptElectives: async (selections) => {
    await delay(1000);
    return { success: true, message: "Selections submitted successfully!" };
  },

  getStaffStats: async () => {
    await delay(400);
    return mockStaffStats;
  }
};
