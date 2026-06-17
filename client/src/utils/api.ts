import configAxios from "../api/axios"

export const getListPost = async <T>(url: string): Promise<T> => {
    const response = await configAxios.get<T>(url);
    return response.data;
}