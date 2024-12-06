import {
  firestoreAPI,
  getCollections,
  queries,
} from 'src/service/firebase/collections';

const insightsCollection = () => getCollections().insights;

const api = {
  list: queries.listPortfolioInsights,
  remove: (id: string) => firestoreAPI.deleteDocument(id, insightsCollection()),
};

export default api;
