import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface SearchResult {
  title: string;
  url: string;
  description: string;
  score: number;
  favicon?: string;
  language: string;
  keywords: string[];
  lastUpdated: string;
}

export async function search(query: string): Promise<SearchResult[]> {
  const response = await axios.get(`${API_BASE_URL}/search`, {
    params: { q: query }
  });
  return response.data;
}

export async function getSuggestions(query: string): Promise<string[]> {
  const response = await axios.get(`${API_BASE_URL}/suggestions`, {
    params: { q: query }
  });
  return response.data;
}

export async function crawlUrls(urls: string[]): Promise<{
  status: string;
  pagesCrawled: number;
  urls: string[];
}> {
  const response = await axios.post(`${API_BASE_URL}/crawl`, urls);
  return response.data;
} 