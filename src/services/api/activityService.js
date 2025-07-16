import activitiesData from "../mockData/activities.json";

let activities = [...activitiesData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const activityService = {
  async getAll() {
    await delay(300);
    return [...activities];
  },

  async getById(id) {
    await delay(200);
    const activity = activities.find(a => a.Id === parseInt(id));
    if (!activity) {
      throw new Error("Activity not found");
    }
    return { ...activity };
  },

  async create(activityData) {
    await delay(250);
    const newActivity = {
      ...activityData,
      Id: Math.max(...activities.map(a => a.Id)) + 1,
      createdAt: new Date().toISOString()
    };
    activities.push(newActivity);
    return { ...newActivity };
  },

  async getByEntity(entityId, entityType) {
    await delay(200);
    return activities.filter(a => 
      a.entityId === parseInt(entityId) && a.entityType === entityType
    );
  },

  async delete(id) {
    await delay(200);
    const index = activities.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Activity not found");
    }
    activities.splice(index, 1);
    return true;
  }
};