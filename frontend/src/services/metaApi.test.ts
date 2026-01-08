import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { metaApi } from './metaApi';

vi.mock('axios');

describe('metaApi', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('getObjects fetches objects', async () => {
    const mockObjects = [{ id: '1', name: 'obj1' }];
    (axios.get as any).mockResolvedValue({ data: mockObjects });

    const result = await metaApi.getObjects();
    
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/meta/objects'), expect.any(Object));
    expect(result).toEqual(mockObjects);
  });
});
