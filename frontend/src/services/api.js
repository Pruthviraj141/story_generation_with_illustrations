const API = {
  generateStory: async (payload) => {
    const response = await fetch("/story/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error("Failed to generate story");
    }
    return response.json();
  },
  createStorybook: async (payload) => {
    const response = await fetch("/create/storybook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error("Failed to create storybook");
    }
    return response.json();
  },
  illustrateStory: async (payload) => {
    const response = await fetch("/illustrate/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error("Failed to illustrate story");
    }
    return response.json();
  }
};

export default API;
